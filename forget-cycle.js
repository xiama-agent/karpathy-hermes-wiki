'use strict';

const fs = require('fs');
const path = require('path');
const {
  ROOT,
  WIKI,
  ARCHIVE,
  ensureBaseDirs,
  walkMarkdown,
  parseFrontmatter,
  writeMarkdown,
  upsertIndexEntry,
  appendLog
} = require('./wiki-utils');

function parseArgs() {
  return { dryRun: process.argv.slice(2).includes('--dry-run') };
}

function collectCandidates() {
  const factsDir = path.join(WIKI, '04-facts');
  const now = Date.now();
  const threshold = 14 * 24 * 60 * 60 * 1000;
  const candidates = [];

  for (const file of walkMarkdown(factsDir)) {
    const content = fs.readFileSync(file, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed.data) continue;
    const trust = Number(parsed.data.trust || 1);
    const updated = new Date(parsed.data.last_updated || 0);
    if (trust < 0.3 && now - updated.getTime() > threshold) {
      candidates.push({ file, content, title: parsed.data.title || path.basename(file, '.md') });
    }
  }

  return candidates;
}

function archiveCandidate(item, dryRun) {
  const target = path.join(ARCHIVE, path.basename(item.file));
  if (!dryRun) {
    writeMarkdown(target, item.content);
    fs.unlinkSync(item.file);
  }
  upsertIndexEntry(target, item.title, 'archived by forget-cycle', dryRun);
  appendLog('forget', path.basename(item.file), dryRun);
  return target;
}

function main() {
  ensureBaseDirs();
  const opts = parseArgs();
  const candidates = collectCandidates();
  const moved = [];

  for (const item of candidates) {
    moved.push(path.relative(ROOT, archiveCandidate(item, opts.dryRun)).replace(/\\/g, '/'));
  }

  console.log(JSON.stringify({
    scanned: candidates.length,
    moved,
    dryRun: opts.dryRun
  }, null, 2));
}

main();
