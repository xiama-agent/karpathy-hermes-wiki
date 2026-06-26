// skill-extract.js — Skill → Wiki 知识萃取 (v3.1.5)
// 跑法：node skill-extract.js <skill-name> [--dry-run]
// 输出：wiki/99-temp/candidate-skill-{name}-{date}.md
// 设计依据：skills/system/harness-continuous-learning/SKILL.md L15-47

const fs = require('fs');
const path = require('path');

const HERMES_HOME = 'C:\\Users\\YANG\\AppData\\Local\\hermes';
const SKILLS_DIR = path.join(HERMES_HOME, 'skills');
const BRAIN_ROOT = 'D:\\ai_schedule\\hermes-brain';
const WIKI = path.join(BRAIN_ROOT, 'wiki');
const TEMP = path.join(WIKI, '99-temp');

// ===== Frontmatter 解析 =====
function extractFrontmatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return null;
  return m[1];
}

// ===== 路径扫描 =====
const PATH_PATTERNS = [
  // Windows 绝对路径 D:\xxx 或 C:\xxx (排除占位符 xxx/yyy/zzz)
  /[CD]:\\(?!xxx\W|yyy\W|zzz\W)(?:[^\s'",\)\]`\\]|\\(?!\W))+?(?=\W|$)/g,
  // Unix home 路径 ~/.xxx
  /~\/(?:[^\s'",\)\]`\\]|\\(?!\W))+?(?=\W|$)/g,
  // 环境变量 %VAR% 或 %VAR_PATH%
  /%[A-Z_][A-Z0-9_]*%?/g,
];

// 排除明显是占位符/示例的路径
const PATH_BLACKLIST = /^(D:\\xxx|C:\\xxx|D:\\yyy|C:\\yyy|D:\\zzz|C:\\zzz|~\/xxx|~\/yyy|~\/zzz)$/i;

function scanPaths(text) {
  const found = new Set();
  for (const re of PATH_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      let p = m[0].replace(/[`'".,;:!?。，；：！？]+$/, ''); // 去尾部标点
      if (PATH_BLACKLIST.test(p)) continue;
      if (p.length < 4) continue; // 太短不是真路径
      found.add(p);
    }
  }
  return [...found];
}

// ===== 工具命令扫描 =====
const TOOL_PATTERNS = [
  /npm\s+(install|uninstall|i|rm)\s+(-g|--global)?\s*[\w@/\-\.]+/gi,
  /pnpm\s+(install|uninstall|i|rm|add)\s+(-g|--global)?\s*[\w@/\-\.]+/gi,
  /yarn\s+(add|remove|install)\s+(global)?\s*[\w@/\-\.]+/gi,
  /pip\s+(install|uninstall)\s+[\w\-\.]+/gi,
  /hermes\s+(plugins?|mcp|skills?)\s+[\w\-]+/gi,
  /cargo\s+(install|add)\s+[\w\-]+/gi,
];

function scanTools(text) {
  const found = new Set();
  for (const re of TOOL_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      found.add(m[0].trim());
    }
  }
  return [...found];
}

// ===== 配置值扫描 =====
const CONFIG_KEYWORDS = ['api_key', 'api-key', 'apikey', 'port', 'url', 'endpoint', 'token', 'secret', 'password', 'host', 'database_url', 'db_url'];

function scanConfigs(text) {
  const found = new Set();
  for (const kw of CONFIG_KEYWORDS) {
    // 匹配 `KEY=VALUE` 或 `KEY: VALUE` 或 `"KEY": "VALUE"` 模式
    const re = new RegExp(`\\b${kw.replace(/[_-]/g, '[_-]?')}\\s*[:=]\\s*["']?([^\\s"',\\]\\)]+)["']?`, 'gi');
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      found.add(`${kw}: ${m[1]}`);
    }
  }
  return [...found];
}

// ===== 偏好声明扫描 =====
const PREFERENCE_PATTERNS = [
  /YANG\s*(喜欢|不用|优先用|总是|从不|不要|必须)/g,
  /(优先用|必须用|避免用)\s*[`"']?([^`"'\n。,，]{2,30})[`"']?/g,
];

function scanPreferences(text) {
  const found = new Set();
  for (const re of PREFERENCE_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      found.add(m[0].trim());
    }
  }
  return [...found];
}

// ===== Wiki 已有内容检查 =====
function wikiHas(item) {
  if (!fs.existsSync(WIKI)) return false;
  const pages = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) pages.push(full);
    }
  })(WIKI);

  const needle = item.toLowerCase();
  for (const p of pages) {
    try {
      const content = fs.readFileSync(p, 'utf8').toLowerCase();
      if (content.includes(needle)) return true;
    } catch (e) { /* skip unreadable */ }
  }
  return false;
}

function filterNew(items) {
  return items.filter(i => !wikiHas(i));
}

// ===== 主流程 =====
function extractSkill(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    console.error(`❌ Skill not found: ${skillPath}`);
    console.error(`\n可用 skill:`);
    if (fs.existsSync(SKILLS_DIR)) {
      (function walk(dir, prefix) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (entry.isDirectory()) {
            const sub = path.join(dir, entry.name);
            const md = path.join(sub, 'SKILL.md');
            if (fs.existsSync(md)) {
              console.error(`  ${path.relative(SKILLS_DIR, sub).replace(/\\/g, '/')}`);
            }
            walk(sub, prefix + entry.name + '/');
          }
        }
      })(SKILLS_DIR, '');
    }
    process.exit(1);
  }

  const content = fs.readFileSync(skillPath, 'utf8');
  const fmRaw = extractFrontmatter(content);

  // 解析 frontmatter 字段
  let name = skillName, description = '', tags = [], useCases = [], source = skillName;
  if (fmRaw) {
    const nameMatch = fmRaw.match(/^name:\s*(.+)$/m);
    const descMatch = fmRaw.match(/^description:\s*"?(.+?)"?$/m);
    if (nameMatch) name = nameMatch[1].trim();
    if (descMatch) description = descMatch[1].trim();
    // tags — 支持顶层 tags: [a, b] 或嵌套 metadata.hermes.tags: [a, b]
    const topTags = fmRaw.match(/^tags:\s*\[([^\]]+)\]/m);
    const nestedTags = fmRaw.match(/^\s+tags:\s*\[([^\]]+)\]/m);
    const tagsRaw = topTags || nestedTags;
    if (tagsRaw) tags = tagsRaw[1].split(',').map(s => s.trim());
    // use_cases
    const useMatch = fmRaw.match(/^use_cases:\s*\[([^\]]+)\]/m);
    if (useMatch) useCases = useMatch[1].split(',').map(s => s.replace(/['"]/g, '').trim());
  }

  // 扫正文(去掉 frontmatter 部分)
  const body = fmRaw ? content.replace(/^---[\s\S]*?---\s*/, '') : content;

  const allPaths = scanPaths(body);
  const allTools = scanTools(body);
  const allConfigs = scanConfigs(body);
  const allPrefs = scanPreferences(body);

  // 对比 Wiki,只保留"Wiki 没有"的
  const newPaths = filterNew(allPaths);
  const newTools = filterNew(allTools);
  const newConfigs = filterNew(allConfigs);
  const newPrefs = filterNew(allPrefs);

  return {
    skillName,
    name,
    description,
    tags,
    useCases,
    source,
    totalScanned: {
      paths: allPaths.length,
      tools: allTools.length,
      configs: allConfigs.length,
      prefs: allPrefs.length,
    },
    newKnowledge: {
      paths: newPaths,
      tools: newTools,
      configs: newConfigs,
      prefs: newPrefs,
    },
  };
}

// ===== 输出 candidate 文件 =====
function writeCandidate(result, dryRun = false) {
  const today = new Date().toISOString().slice(0, 10);
  const fname = `candidate-skill-${result.skillName.replace(/[\\/]/g, '-')}-${today}.md`;
  const outPath = path.join(TEMP, fname);

  const totalNew = result.newKnowledge.paths.length + result.newKnowledge.tools.length +
                   result.newKnowledge.configs.length + result.newKnowledge.prefs.length;

  const lines = [];
  lines.push('---');
  lines.push(`id: HERMES-CANDIDATE-SKILL-${result.skillName.toUpperCase().replace(/[\\/]/g, '-')}`);
  lines.push(`title: Skill 知识候选 — ${result.name}`);
  lines.push(`type: candidate_knowledge`);
  lines.push(`tags: [candidate, skill-extract, ${result.tags.slice(0, 3).join(', ')}]`);
  lines.push(`use_cases: ${JSON.stringify(result.useCases.length ? result.useCases : ['Skill 知识萃取候选'])}`);
  lines.push(`trust: 0.40`);
  lines.push(`source: skill-extract.js from ${result.source}`);
  lines.push(`last_updated: ${today}`);
  lines.push('---');
  lines.push('');
  lines.push(`# Skill 知识候选 — ${result.name}`);
  lines.push('');
  lines.push(`> 由 \`skill-extract.js\` 自动生成（${today}）。**人工 review 后再决定升级到正式 Wiki 页面**。`);
  lines.push('');
  lines.push(`## 📋 元数据`);
  lines.push('');
  lines.push(`- **原 skill**: \`${result.skillName}\``);
  lines.push(`- **name**: ${result.name}`);
  lines.push(`- **description**: ${result.description || '(空)'}`);
  lines.push(`- **tags**: ${result.tags.length ? result.tags.map(t => `\`${t}\``).join(', ') : '(空)'}`);
  lines.push(`- **use_cases**: ${result.useCases.length ? result.useCases.map(u => `\`${u}\``).join(', ') : '(空)'}`);
  lines.push('');
  lines.push(`## 🔍 扫描统计`);
  lines.push('');
  lines.push(`| 类型 | 扫到 | Wiki 没有 | 新知识占比 |`);
  lines.push(`|---|---|---|---|`);
  for (const [type, total, newK] of [
    ['路径', result.totalScanned.paths, result.newKnowledge.paths.length],
    ['工具', result.totalScanned.tools, result.newKnowledge.tools.length],
    ['配置', result.totalScanned.configs, result.newKnowledge.configs.length],
    ['偏好', result.totalScanned.prefs, result.newKnowledge.prefs.length],
  ]) {
    const pct = total > 0 ? Math.round(newK / total * 100) : 0;
    lines.push(`| ${type} | ${total} | ${newK} | ${pct}% |`);
  }
  lines.push('');

  if (totalNew === 0) {
    lines.push(`## ✅ 无新知识`);
    lines.push('');
    lines.push(`此 skill 的所有知识都已在 Wiki 中,无需新建页面。`);
    lines.push('');
    lines.push(`> **lint 建议**: 下次 lint 看到此 candidate 文件(无新知识),可直接归档。`);
  } else {
    lines.push(`## 🆕 待升级知识 (${totalNew} 条)`);
    lines.push('');

    if (result.newKnowledge.paths.length) {
      lines.push(`### 路径 (${result.newKnowledge.paths.length})`);
      lines.push('');
      result.newKnowledge.paths.forEach(p => lines.push(`- \`${p}\``));
      lines.push('');
    }
    if (result.newKnowledge.tools.length) {
      lines.push(`### 工具/命令 (${result.newKnowledge.tools.length})`);
      lines.push('');
      result.newKnowledge.tools.forEach(t => lines.push(`- \`${t}\``));
      lines.push('');
    }
    if (result.newKnowledge.configs.length) {
      lines.push(`### 配置值 (${result.newKnowledge.configs.length})`);
      lines.push('');
      result.newKnowledge.configs.forEach(c => lines.push(`- \`${c}\``));
      lines.push('');
    }
    if (result.newKnowledge.prefs.length) {
      lines.push(`### 偏好 (${result.newKnowledge.prefs.length})`);
      lines.push('');
      result.newKnowledge.prefs.forEach(p => lines.push(`- ${p}`));
      lines.push('');
    }

    lines.push(`## 🚀 升级建议`);
    lines.push('');
    lines.push(`人工 review 后:`);
    lines.push(`1. 把有价值的项**合并到现有 Wiki 页面** (推荐,避免新建孤页)`);
    lines.push(`2. 或**新建 Wiki 页面** \`wiki/02-knowledge/skill-${result.skillName}.md\``);
    lines.push(`3. 更新 INDEX.md 收录新页面`);
    lines.push(`4. 把本文件**移出 99-temp**(升级后归档或删除)`);
    lines.push('');
    lines.push(`**取消条件**: 如果这些"新知识"其实是误判(如扫描到代码示例里的临时变量),直接删除本文件。`);
  }

  const content = lines.join('\n');
  if (dryRun) {
    console.log('=== DRY RUN ===');
    console.log(`Will write to: ${outPath}`);
    console.log('---');
    console.log(content);
    return outPath;
  }

  if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP, { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  return outPath;
}

// ===== Main =====
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('用法: node skill-extract.js <skill-name> [--dry-run]');
    console.error('示例: node skill-extract.js system/harness-continuous-learning');
    process.exit(1);
  }
  const skillName = args[0];
  const dryRun = args.includes('--dry-run');

  console.log(`🔍 萃取 skill: ${skillName}`);
  const result = extractSkill(skillName);

  const total = Object.values(result.totalScanned).reduce((a, b) => a + b, 0);
  const totalNew = result.newKnowledge.paths.length + result.newKnowledge.tools.length +
                   result.newKnowledge.configs.length + result.newKnowledge.prefs.length;
  console.log(`📊 扫到 ${total} 条,Wiki 没有的 ${totalNew} 条`);

  const outPath = writeCandidate(result, dryRun);
  console.log(`✅ ${dryRun ? '预览' : '已写入'}: ${outPath}`);
}

main();