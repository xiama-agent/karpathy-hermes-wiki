'use strict';

const path = require('path');
const {
  ROOT,
  ensureBaseDirs,
  inferCategoryFromText,
  hyphenTitle,
  writeMarkdown,
  upsertIndexEntry,
  appendLog,
  buildPageContent,
  summarizeText
} = require('./wiki-utils');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { title: '', content: '', tags: '', auto: false, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title') opts.title = args[++i] || '';
    else if (args[i] === '--content') opts.content = args[++i] || '';
    else if (args[i] === '--tags') opts.tags = args[++i] || '';
    else if (args[i] === '--auto') opts.auto = true;
    else if (args[i] === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

function evaluateWorth(content, tags, title) {
  const lower = `${title}\n${tags}\n${content}`.toLowerCase();
  if (/token|password|api key|secret|私密|敏感/.test(lower)) return { ok: false, reason: 'sensitive' };
  if (/一次性|临时|稍后|随便/.test(lower)) return { ok: false, reason: 'one-off' };
  if (/猜测|可能|大概/.test(lower) && !/对比|结论|总结/.test(lower)) return { ok: false, reason: 'unconfirmed' };
  if (/记住这个|对比|总结|结论|多来源|分析/.test(lower)) return { ok: true, reason: 'reusable' };
  return { ok: !!content.trim() && content.length > 80, reason: content.length > 80 ? 'content-rich' : 'too-short' };
}

function chooseCategory(content, tags) {
  const guessed = inferCategoryFromText(content, tags);
  return guessed === '04-facts' ? '04-facts' : '02-knowledge';
}

function main() {
  ensureBaseDirs();
  const opts = parseArgs();
  if (!opts.title || !opts.content) {
    console.error('Usage: node answer-backfill.js --title "..." --content "..." [--tags "..."] [--auto] [--dry-run]');
    process.exit(1);
  }

  const verdict = evaluateWorth(opts.content, opts.tags, opts.title);
  if (opts.auto && !verdict.ok) {
    console.log(JSON.stringify({ stored: false, reason: verdict.reason }, null, 2));
    return;
  }
  if (!opts.auto && !verdict.ok) {
    console.error(`Refused to store: ${verdict.reason}`);
    process.exit(1);
  }

  const category = chooseCategory(opts.content, opts.tags);
  const slug = hyphenTitle(opts.title);
  const filePath = path.join(ROOT, 'wiki', category, `${slug}.md`);
  const tags = opts.tags ? opts.tags.split(',').map(tag => tag.trim()).filter(Boolean) : ['backfill'];
  const frontmatter = {
    id: `HERMES-BACKFILL-${slug}`,
    title: opts.title,
    type: category === '04-facts' ? 'fact' : 'knowledge',
    tags,
    trust: 0.3,
    use_cases: ['复用高质量回答', '后续相似问题快速召回'],
    source: 'conversation-backfill',
    last_updated: new Date().toISOString().slice(0, 10)
  };
  const content = buildPageContent(frontmatter, opts.title, {
    core: `## 核心内容\n\n${opts.content.trim()}`,
    recall: '## 召回条件\n\n- 当后续问题需要复用本结论、对比分析或稳定说明时召回。',
    links: '## 相关链接\n'
  });

  if (!opts.dryRun) writeMarkdown(filePath, content);
  upsertIndexEntry(filePath, opts.title, summarizeText(opts.content, 160), opts.dryRun);
  appendLog('backfill', opts.title, opts.dryRun);

  console.log(JSON.stringify({
    stored: true,
    file: path.relative(ROOT, filePath).replace(/\\/g, '/'),
    category,
    reason: verdict.reason,
    dryRun: opts.dryRun
  }, null, 2));
}

main();
