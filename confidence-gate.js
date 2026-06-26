'use strict';

const { search } = require('./auto-retrieve.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { query: '', limit: 5 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query') opts.query = args[++i] || '';
    else if (args[i] === '--limit') opts.limit = parseInt(args[++i], 10) || 5;
  }
  return opts;
}

function trustLevel(maxTrust, covered) {
  if (!covered) return 'none';
  if (maxTrust >= 0.8) return 'high';
  if (maxTrust >= 0.5) return 'medium';
  return 'low';
}

function evaluate(query, limit) {
  const results = search(query, limit);
  const maxTrust = results.reduce((max, item) => Math.max(max, Number(item.trust || 0)), 0);
  const covered = results.length > 0 && maxTrust >= 0.5;
  const level = trustLevel(maxTrust, covered);
  const matchedPages = results.map(item => ({
    page: item.page,
    title: item.title,
    trust: item.trust,
    freshness: item.freshness,
    score: item.score
  }));
  const suggestion = covered
    ? 'Wiki 已覆盖，可基于 Wiki 回答'
    : '模型知识，未在 Wiki 中验证';

  return {
    query,
    covered,
    trust: Number(maxTrust.toFixed(2)),
    trust_level: level,
    matched_pages: matchedPages,
    suggestion
  };
}

function main() {
  const opts = parseArgs();
  if (!opts.query) {
    console.error('Usage: node confidence-gate.js --query "..." [--limit 5]');
    process.exit(1);
  }
  console.log(JSON.stringify(evaluate(opts.query, opts.limit), null, 2));
}

if (require.main === module) main();
module.exports = { evaluate };
