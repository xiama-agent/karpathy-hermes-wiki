'use strict';
// recall-monitor.js — 召回率监控 (v1.0)
// 用法: node recall-monitor.js [--window=50] [--threshold=0.8]
// 读取 recall-log.jsonl 计算近期召回率
//
// --window=N      : 只计算最近 N 条记录 (默认 50)
// --threshold=0.8 : 低于此值报警 (默认 0.8)

const fs = require('fs');

const LOG_FILE = 'D:\\ai_schedule\\hermes-brain\\recall-log.jsonl';

function parseArgs() {
  const args = process.argv.slice(2);
  let window = 50;
  let threshold = 0.8;
  for (const arg of args) {
    if (arg.startsWith('--window=')) window = parseInt(arg.split('=')[1], 10);
    if (arg.startsWith('--threshold=')) threshold = parseFloat(arg.split('=')[1]);
    if (arg === '--help' || arg === '-h') {
      console.log('用法: node recall-monitor.js [--window=50] [--threshold=0.8]');
      process.exit(0);
    }
  }
  return { window, threshold };
}

function main() {
  const opts = parseArgs();

  if (!fs.existsSync(LOG_FILE)) {
    console.log(`# 召回率监控报告 — ${new Date().toISOString().slice(0, 10)}`);
    console.log('');
    console.log('⚠️ 召回日志不存在。请先执行 Topic-Gate 搜索以生成日志。');
    console.log(`  预期路径: ${LOG_FILE}`);
    return;
  }

  const lines = fs.readFileSync(LOG_FILE, 'utf8')
    .split('\n')
    .filter(l => l.trim())
    .map(l => {
      try { return JSON.parse(l); }
      catch { return null; }
    })
    .filter(Boolean);

  // Take only the last N entries
  const recent = lines.slice(-opts.window);

  if (recent.length === 0) {
    console.log('召回日志为空。');
    return;
  }

  const total = recent.length;
  const hits = recent.filter(e => e.status === 'hit' || e.status === 'semantic_hit').length;
  const misses = recent.filter(e => e.status === 'miss').length;
  const semanticMisses = recent.filter(e => e.status === 'semantic_miss').length;
  const rate = total > 0 ? (hits / total) : 1;

  console.log(`# 召回率监控报告 — ${new Date().toISOString().slice(0, 10)}`);
  console.log('');
  console.log(`统计窗口: 最近 ${total} 次搜索 (共 ${lines.length} 条历史记录)`);
  console.log(`命中: ${hits} | 未命中(关键词): ${misses} | 未命中(语义): ${semanticMisses}`);
  console.log(`召回率: ${(rate * 100).toFixed(1)}%`);
  console.log('');

  if (rate >= opts.threshold) {
    console.log(`✅ 召回率在阈值 (${(opts.threshold * 100).toFixed(0)}%) 以上，正常。`);
  } else {
    console.log(`❌ 召回率低于阈值 (${(opts.threshold * 100).toFixed(0)}%)！`);
    console.log('');
    console.log('建议操作:');
    console.log('1. 检查最近 miss 的搜索词，看是否存在关键词不匹配');
    console.log('2. 运行 node age-track.js 检查是否有页面过期');
    console.log('3. 检查 Wiki 索引是否完整: node lint.js');
  }

  // Show recent misses
  const recentMisses = recent.filter(e => e.status === 'miss' || e.status === 'semantic_miss').slice(-5);
  if (recentMisses.length > 0) {
    console.log('');
    console.log('最近的未命中记录:');
    for (const m of recentMisses.reverse()) {
      console.log(`  [${m.ts.slice(0, 16)}] 搜: "${m.terms}"`);
    }
  }

  console.log('');
  console.log('---');
  console.log(`窗口: ${opts.window} | 阈值: ${(opts.threshold * 100).toFixed(0)}%`);
}

main();
