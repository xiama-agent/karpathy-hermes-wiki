// rsi-log.js — 工具失败自动记录到 RSI Ledger
// 用法：node rsi-log.js --error "xxx" --root-cause "yyy" --fix "zzz"
// 输出：自动追加到 wiki/03-system/rsi-ledger.md 的当日节点下

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const RSI_FILE = path.join(ROOT, 'wiki', '03-system', 'rsi-ledger.md');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { error: '', rootCause: '', fix: '' };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--error') {
      opts.error = args[++i] || '';
    } else if (args[i] === '--root-cause') {
      opts.rootCause = args[++i] || '';
    } else if (args[i] === '--fix') {
      opts.fix = args[++i] || '';
    }
  }
  
  return opts;
}

function generatePatternKey() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  return `tool-failure-${dateStr}-${timeStr}`;
}

function appendToRsiLedger(opts) {
  if (!opts.error) {
    console.error('❌ 缺少必需参数: --error');
    process.exit(1);
  }
  
  const today = new Date().toISOString().slice(0, 10);
  const patternKey = generatePatternKey();
  
  // 确保 rsi-ledger.md 存在
  if (!fs.existsSync(RSI_FILE)) {
    // 创建目录结构
    const dir = path.dirname(RSI_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // 创建基础结构
    const baseContent = `# RSI Ledger — 系统改进清单\n\n> 自动生成的 RSI (Recurring System Issues) 追踪清单\n> 来源: rsi-log.js 工具\n\n---\n\n## 🔧 自动处理规则\n\n此处记录由工具自动检测并处理的系统性问题。\n\n`;
    fs.writeFileSync(RSI_FILE, baseContent, 'utf8');
  }
  
  let content = fs.readFileSync(RSI_FILE, 'utf8');
  
  // 构建新的 RSI 条目
  const entry = `
### ${today} {${patternKey}}

- **error**: ${opts.error}
- **root-cause**: ${opts.rootCause || '待分析'}
- **fix**: ${opts.fix || '待修复'}
- **status**: monitoring
- **source**: rsi-log.js 自动记录
`;
  
  // 插到 "## 🔧 自动处理规则" 之前
  const marker = '## 🔧 自动处理规则';
  if (content.includes(marker)) {
    content = content.replace(marker, entry.trimStart() + '\n\n' + marker);
  } else {
    content += '\n' + entry;
  }
  
  fs.writeFileSync(RSI_FILE, content, 'utf8');
  
  console.log('✅ RSI 条目已记录:');
  console.log(`   文件: ${path.relative(ROOT, RSI_FILE)}`);
  console.log(`   日期: ${today}`);
  console.log(`   模式: ${patternKey}`);
  console.log(`   错误: ${opts.error.substring(0, 50)}${opts.error.length > 50 ? '...' : ''}`);
}

function main() {
  const opts = parseArgs();
  
  if (opts.error === '') {
    console.log('用法: node rsi-log.js --error "错误描述" --root-cause "根因分析" --fix "修复方案"');
    console.log('');
    console.log('示例:');
    console.log('  node rsi-log.js --error "路径不存在" --root-cause "手误路径" --fix "验证路径后重试"');
    process.exit(1);
  }
  
  appendToRsiLedger(opts);
}

main();
