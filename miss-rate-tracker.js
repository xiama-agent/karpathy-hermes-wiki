'use strict';

const path = require('path');
const { ROOT, listWikiPages, readMarkdown } = require('./wiki-utils');
const { search } = require('./auto-retrieve.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { error: '', query: '', limit: 5 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--error') opts.error = args[++i] || '';
    else if (args[i] === '--query') opts.query = args[++i] || '';
    else if (args[i] === '--limit') opts.limit = parseInt(args[++i], 10) || 5;
  }
  return opts;
}

function detectWikiCoverage(text) {
  const lower = text.toLowerCase();
  for (const file of listWikiPages()) {
    const content = readMarkdown(file).toLowerCase();
    if (lower.length >= 8 && content.includes(lower.slice(0, 8))) {
      return path.relative(ROOT, file).replace(/\\/g, '/');
    }
    if (content.includes(lower)) {
      return path.relative(ROOT, file).replace(/\\/g, '/');
    }
  }
  return null;
}

function main() {
  const opts = parseArgs();
  const probe = opts.query || opts.error;
  if (!probe) {
    console.error('Usage: node miss-rate-tracker.js --error "..." [--query "..."] [--limit 5]');
    process.exit(1);
  }

  const wikiPage = detectWikiCoverage(probe);
  const retrieved = search(probe, opts.limit);
  const result = {
    error: opts.error || probe,
    query: opts.query || probe,
    wiki_has_info: !!wikiPage,
    wiki_page: wikiPage,
    wiki_retrieved: retrieved.length > 0,
    retrieved_pages: retrieved.map(item => item.page)
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
