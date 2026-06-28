'use strict';
// semantic-fallback.js — 关键词搜索失败后的语义搜索降级 (v1.0)
// 用法: node semantic-fallback.js <query>
// 调用 semantic_memory.py recall <query> 做向量搜索
// 输出: JSON { hit: bool, results: [...] }

const { execSync } = require('child_process');

const SEM_PATH = 'C:\\Users\\YANG\\.hermes\\semantic_memory.py';
const PYTHON = 'python';

function main() {
  const query = process.argv.slice(2).join(' ');
  if (!query) {
    console.log(JSON.stringify({ hit: false, error: 'no query provided', results: [] }));
    process.exit(0);
  }

  // Try semantic memory recall
  try {
    const cmd = `${PYTHON} "${SEM_PATH}" recall "${query.replace(/"/g, '\\"')}"`;
    const stdout = execSync(cmd, { timeout: 15000, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });

    // Parse output - semantic_memory.py returns free text, look for results
    const lines = stdout.split('\n').filter(l => l.trim());
    
    if (lines.length > 0) {
      console.log(JSON.stringify({
        hit: true,
        results: lines.slice(0, 5).map(l => l.trim()),
        source: 'semantic_memory'
      }));
    } else {
      console.log(JSON.stringify({ hit: false, results: [], source: 'semantic_memory' }));
    }
  } catch (err) {
    console.log(JSON.stringify({
      hit: false,
      error: err.message,
      results: [],
      source: 'semantic_memory'
    }));
  }
}

main();
