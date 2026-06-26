// markdown-validator.js — 写入时 schema 校验
// 用法：node markdown-validator.js --file "wiki/02-knowledge/test.md" --content "content"
// 功能：校验 Wiki 页面格式和内容合规性

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const WIKI = path.join(ROOT, 'wiki');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { file: '', content: '', strict: false };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file') {
      opts.file = args[++i] || '';
    } else if (args[i] === '--content') {
      opts.content = args[++i] || '';
    } else if (args[i] === '--strict') {
      opts.strict = true;
    }
  }
  
  return opts;
}

function validateFrontmatter(content) {
  const errors = [];
  const warnings = [];
  
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!fmMatch) {
    errors.push('缺少 frontmatter (需要 --- 包围的元数据块)');
    return { errors, warnings, frontmatter: null, valid: false };
  }
  
  const fm = fmMatch[1];
  const frontmatter = {};
  
  // 必填字段
  const requiredFields = ['id', 'title', 'type', 'tags', 'trust', 'last_updated'];
  const optionalFields = ['use_cases', 'source'];
  
  for (const field of requiredFields) {
    const match = fm.match(new RegExp(`^${field}:\s*(.+)$`, 'm'));
    if (!match) {
      errors.push(`缺少必填字段: ${field}`);
    } else {
      frontmatter[field] = match[1].trim();
    }
  }
  
  // 类型验证
  if (frontmatter.type) {
    const validTypes = ['identity', 'preference', 'rule', 'fact', 'knowledge', 'workflow', 'reference'];
    if (!validTypes.includes(frontmatter.type)) {
      warnings.push(`type 值不是标准类型: ${frontmatter.type} (应为: ${validTypes.join(', ')})`);
    }
  }
  
  // trust 验证
  if (frontmatter.trust) {
    const trust = parseFloat(frontmatter.trust);
    if (isNaN(trust) || trust < 0 || trust > 1) {
      errors.push(`trust 值无效: ${frontmatter.trust} (应为 0.0-1.0)`);
    }
  }
  
  // last_updated 验证
  if (frontmatter.last_updated) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(frontmatter.last_updated)) {
      warnings.push(`last_updated 格式建议: YYYY-MM-DD (当前: ${frontmatter.last_updated})`);
    }
  }
  
  // ID 格式验证
  if (frontmatter.id) {
    const idPattern = /^HERMES-[A-Z]+-\d+$/;
    if (!idPattern.test(frontmatter.id)) {
      warnings.push(`id 格式建议: HERMES-CATEGORY-NNN (当前: ${frontmatter.id})`);
    }
  }
  
  const valid = errors.length === 0;
  return { errors, warnings, frontmatter, valid };
}

function validateWikiLinks(content) {
  const errors = [];
  const warnings = [];
  
  // 提取所有 [[wiki-link]] 引用
  const linkMatches = content.match(/\[\[wiki\/([^\]]+)\]\]/g) || [];
  
  for (const link of linkMatches) {
    const cleanLink = link.replace(/^\[\[wiki\//, '').replace(/\]\]$/, '');
    const linkPath = path.join(WIKI, cleanLink);
    
    if (!fs.existsSync(linkPath)) {
      warnings.push(`Wiki 链接可能断链: ${link}`);
    }
  }
  
  return { errors, warnings, valid: errors.length === 0 };
}

function validateMarkdownSyntax(content) {
  const errors = [];
  const warnings = [];
  
  // 检查标题层级
  const headers = content.match(/^#+\s+.+$/gm) || [];
  let prevLevel = 0;
  
  for (const header of headers) {
    const level = (header.match(/^#+/) || [''])[0].length;
    if (level > prevLevel + 1) {
      warnings.push(`标题层级跳跃: 从 ${prevLevel} 到 ${level}`);
    }
    prevLevel = level;
  }
  
  // 检查代码块
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  for (const block of codeBlocks) {
    const firstLine = block.split('\n')[0];
    if (firstLine === '```') {
      warnings.push('代码块缺少语言标识');
    }
  }
  
  return { errors, warnings, valid: errors.length === 0 };
}

function validateFileStructure(content) {
  const errors = [];
  const warnings = [];
  
  // 检查是否至少有一个标题
  if (!/^#\s+.+$/m.test(content)) {
    errors.push('缺少主标题 (# 标题)');
  }
  
  // 检查内容长度
  const bodyContent = content.replace(/^---[\s\S]*?---/, '').trim();
  if (bodyContent.length < 20) {
    warnings.push('页面内容过短 (< 20 字符)');
  }
  
  return { errors, warnings, valid: errors.length === 0 };
}

function validateAll(filePath, content, strict = false) {
  const results = {
    frontmatter: validateFrontmatter(content),
    wikiLinks: validateWikiLinks(content),
    markdownSyntax: validateMarkdownSyntax(content),
    fileStructure: validateFileStructure(content),
    overall: { errors: [], warnings: [], valid: true }
  };
  
  // 汇总所有错误和警告
  const allResults = [results.frontmatter, results.wikiLinks, results.markdownSyntax, results.fileStructure];
  
  for (const result of allResults) {
    results.overall.errors.push(...result.errors);
    results.overall.warnings.push(...result.warnings);
  }
  
  results.overall.valid = strict ? 
    results.overall.errors.length === 0 && results.overall.warnings.length === 0 :
    results.overall.errors.length === 0;
  
  return results;
}

function main() {
  const opts = parseArgs();
  
  if (opts.file === '') {
    console.log('用法:');
    console.log('  node markdown-validator.js --file "wiki/02-knowledge/test.md"');
    console.log('  node markdown-validator.js --file "wiki/02-knowledge/test.md" --content "内容"');
    console.log('  node markdown-validator.js --file "wiki/02-knowledge/test.md" --strict');
    console.log('');
    console.log('说明:');
    console.log('  --file: 要校验的文件路径 (必需)');
    console.log('  --content: 直接校验内容 (不读取文件)');
    console.log('  --strict: 严格模式，警告也视为错误');
    process.exit(1);
  }
  
  const content = opts.content || fs.readFileSync(opts.file, 'utf8');
  const results = validateAll(opts.file, content, opts.strict);
  
  console.log('🔍 Markdown 校验结果:');
  console.log(`   文件: ${opts.file}`);
  console.log(`   模式: ${opts.strict ? '严格' : '标准'}`);
  console.log('');
  
  // Frontmatter 检查
  console.log('📋 Frontmatter:');
  console.log(`   状态: ${results.frontmatter.valid ? '✅ 通过' : '❌ 失败'}`);
  if (results.frontmatter.errors.length > 0) {
    results.frontmatter.errors.forEach(err => console.log(`   🚨 错误: ${err}`));
  }
  if (results.frontmatter.warnings.length > 0) {
    results.frontmatter.warnings.forEach(warn => console.log(`   ⚠️  警告: ${warn}`));
  }
  console.log('');
  
  // Wiki 链接检查
  console.log('🔗 Wiki 链接:');
  console.log(`   状态: ${results.wikiLinks.valid ? '✅ 通过' : '❌ 失败'}`);
  if (results.wikiLinks.warnings.length > 0) {
    results.wikiLinks.warnings.forEach(warn => console.log(`   ⚠️  ${warn}`));
  }
  console.log('');
  
  // Markdown 语法检查
  console.log('📝 Markdown 语法:');
  console.log(`   状态: ${results.markdownSyntax.valid ? '✅ 通过' : '❌ 失败'}`);
  if (results.markdownSyntax.warnings.length > 0) {
    results.markdownSyntax.warnings.forEach(warn => console.log(`   ⚠️  ${warn}`));
  }
  console.log('');
  
  // 文件结构检查
  console.log('📁 文件结构:');
  console.log(`   状态: ${results.fileStructure.valid ? '✅ 通过' : '❌ 失败'}`);
  if (results.fileStructure.errors.length > 0) {
    results.fileStructure.errors.forEach(err => console.log(`   🚨 错误: ${err}`));
  }
  if (results.fileStructure.warnings.length > 0) {
    results.fileStructure.warnings.forEach(warn => console.log(`   ⚠️  警告: ${warn}`));
  }
  console.log('');
  
  // 总体结果
  console.log('🎯 总体结果:');
  console.log(`   状态: ${results.overall.valid ? '✅ 通过' : '❌ 失败'}`);
  console.log(`   错误数: ${results.overall.errors.length}`);
  console.log(`   警告数: ${results.overall.warnings.length}`);
  
  process.exit(results.overall.valid ? 0 : 1);
}

main();
