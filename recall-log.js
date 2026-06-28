'use strict';
// recall-log.js — 追加一条召回记录 (v1.0)
// 用法: node recall-log.js <hit|miss|semantic_hit|semantic_miss> <search_terms> <wiki_ids>
//   例: node recall-log.js hit "开发,软件" "software-dev-closed-loop.md"
//   例: node recall-log.js miss "记忆系统,memory" ""

const fs = require('fs');
const path = require('path');

const LOG_FILE = 'D:\\ai_schedule\\hermes-brain\\recall-log.jsonl';

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2 || args[0] === '--help') {
    console.log('用法: node recall-log.js <hit|miss|semantic_hit|semantic_miss> <search_terms> [wiki_ids]');
    process.exit(0);
  }

  const status = args[0];
  const valid = ['hit', 'miss', 'semantic_hit', 'semantic_miss'];
  if (!valid.includes(status)) {
    console.error(`无效状态: ${status}，有效值: ${valid.join(', ')}`);
    process.exit(1);
  }

  const terms = args[1];
  const ids = args[2] || '';

  const entry = {
    ts: new Date().toISOString(),
    status,
    terms,
    wiki_ids: ids
  };

  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
  console.log(`[recall-log] ${status}: ${terms.slice(0, 60)}`);
}

main();
