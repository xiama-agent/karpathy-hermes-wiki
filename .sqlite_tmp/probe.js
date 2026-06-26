// 调查 fact_store RSI 历史
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\YANG\\AppData\\Local\\hermes\\memory_store.db.legacy', { readOnly: true });

console.log('=== TABLES ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log(tables);

if (tables.find(t => t.name === 'facts')) {
  console.log('\n=== facts SCHEMA ===');
  console.log(db.prepare("PRAGMA table_info(facts)").all());

  console.log('\n=== facts COUNT ===');
  console.log(db.prepare("SELECT COUNT(*) as c FROM facts").get());

  console.log('\n=== tags LIKE rsi_ledger ===');
  const rsi = db.prepare("SELECT COUNT(*) as c FROM facts WHERE tags LIKE '%rsi_ledger%'").get();
  console.log('total:', rsi);

  if (rsi.c > 0) {
    console.log('\n=== SAMPLE 5 ===');
    console.log(db.prepare("SELECT fact_id, content, tags, retrieval_count FROM facts WHERE tags LIKE '%rsi_ledger%' ORDER BY fact_id DESC LIMIT 5").all());
  } else {
    console.log('NO rsi_ledger records found.');
  }

  // 检查 tags 列类型(text 还是 json)
  console.log('\n=== SAMPLE 3 facts (first rows) ===');
  console.log(db.prepare("SELECT fact_id, content, tags FROM facts LIMIT 3").all());
}