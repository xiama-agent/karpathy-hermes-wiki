'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\ai_schedule\\hermes-brain';
const WIKI = path.join(ROOT, 'wiki');
const RAW = path.join(ROOT, 'raw');
const SOURCES = path.join(WIKI, 'sources');
const ARCHIVE = path.join(WIKI, '98-archive');
const TEMP = path.join(WIKI, '99-temp');
const INDEX_FILE = path.join(ROOT, 'index.md');
const LOG_DIR = path.join(ROOT, 'log');
const CATEGORY_DIRS = ['00-core', '01-yang', '02-knowledge', '03-system', '04-facts', '98-archive', '99-temp', 'sources'];
const REQUIRED_FIELDS = ['id', 'title', 'type', 'tags', 'trust', 'source', 'last_updated'];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function ensureBaseDirs() {
  [WIKI, SOURCES, ARCHIVE, TEMP, LOG_DIR].forEach(ensureDir);
}

function walkMarkdown(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMarkdown(full, list);
    else if (entry.name.endsWith('.md')) list.push(full);
  }
  return list;
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalTimeString(date = new Date()) {
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0')
  ].join(':');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { data: null, body: content, raw: null };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();
    data[key] = parseFrontmatterValue(rawValue);
  }

  return {
    data,
    body: content.slice(match[0].length),
    raw: match[1]
  };
}

function parseFrontmatterValue(value) {
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map(part => part.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')).filter(Boolean);
  }
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
}

function formatFrontmatter(data) {
  const orderedKeys = ['id', 'title', 'type', 'tags', 'trust', 'use_cases', 'source', 'last_updated', 'retrieval_count'];
  const keys = orderedKeys.concat(Object.keys(data).filter(key => !orderedKeys.includes(key)));
  const lines = [];
  const seen = new Set();

  for (const key of keys) {
    if (seen.has(key) || data[key] === undefined) continue;
    seen.add(key);
    lines.push(`${key}: ${formatFrontmatterValue(data[key])}`);
  }

  return `---\n${lines.join('\n')}\n---\n`;
}

function formatFrontmatterValue(value) {
  if (Array.isArray(value)) {
    return `[${value.map(item => JSON.stringify(String(item))).join(', ')}]`;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  return String(value);
}

function toSlug(input) {
  return String(input)
    .toLowerCase()
    .replace(/[\\/]+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
}

function hyphenTitle(input) {
  return toSlug(String(input).replace(/\.[^.]+$/, ''));
}

function wikiLinkFromPath(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  return `[[${rel}]]`;
}

function readMarkdown(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeMarkdown(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function appendLog(operation, description, dryRun = false) {
  const now = new Date();
  const today = getLocalDateString(now);
  const time = getLocalTimeString(now);
  const logFile = path.join(LOG_DIR, `${today}.md`);
  const entry = `## [${time}] ${operation} | ${description}\n`;
  if (dryRun) return { logFile, entry };

  let content = '';
  if (fs.existsSync(logFile)) {
    content = fs.readFileSync(logFile, 'utf8');
    if (!content.endsWith('\n')) content += '\n';
  } else {
    content = `# 操作日志 ${today}\n\n> 格式：\`## [HH:mm:ss] {operation} | {description}\`\n> 操作类型：init / ingest / query / lint / audit / forget / soul-sync / recall-fail / meltdown\n\n---\n\n`;
  }
  content += `${entry}\n`;
  fs.writeFileSync(logFile, content, 'utf8');
  return { logFile, entry };
}

function listWikiPages() {
  return walkMarkdown(WIKI).filter(file => !file.includes(`${path.sep}99-temp${path.sep}`));
}

function inferCategoryFromText(text, sourcePath = '') {
  const lower = `${sourcePath}\n${text}`.toLowerCase();
  if (/architecture|audit|框架|架构|memory|wiki|lint|ingest|query|forget|cron|schedule|system|hook|agents/.test(lower)) return '03-system';
  if (/yang|预算|订阅|桌面|头像|偏好|产品经理/.test(lower)) return '01-yang';
  if (/路径|plugin|mcp|api|模型|知识|教程|文档|skill/.test(lower)) return '02-knowledge';
  if (/rule|core|身份|铁律|宪法|soul/.test(lower)) return '00-core';
  return '04-facts';
}

function extractTitle(content, fallback = 'untitled') {
  const parsed = parseFrontmatter(content);
  if (parsed.data && parsed.data.title) return parsed.data.title;
  const h1 = parsed.body.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : fallback;
}

function ensureIndexFile() {
  if (!fs.existsSync(INDEX_FILE)) {
    fs.writeFileSync(INDEX_FILE, '# Hermes Wiki INDEX\n\n', 'utf8');
  }
}

function upsertIndexEntry(filePath, title, description, dryRun = false) {
  ensureIndexFile();
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const line = `- [[${rel}]] — ${title}${description ? ` | ${description}` : ''}`;
  const current = fs.readFileSync(INDEX_FILE, 'utf8').split(/\r?\n/);
  const filtered = current.filter(row => !row.includes(`[[${rel}]]`));
  while (filtered.length > 0 && filtered[filtered.length - 1] === '') filtered.pop();
  filtered.push(line, '');
  const next = filtered.join('\n');
  if (!dryRun) fs.writeFileSync(INDEX_FILE, next, 'utf8');
  return line;
}

function listRawFiles(targetDir = RAW) {
  const files = [];
  if (!fs.existsSync(targetDir)) return files;
  for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
    const full = path.join(targetDir, entry.name);
    if (entry.isDirectory()) files.push(...listRawFiles(full));
    else files.push(full);
  }
  return files;
}

function summarizeText(content, maxLen = 180) {
  const text = content
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\|[^\n]*\|/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/\[\[[^\]]+\]\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 3)}...`;
}

function ensureRelatedLinksSection(body) {
  if (/^## 相关链接/m.test(body)) return body;
  const trimmed = body.trimEnd();
  return `${trimmed}\n\n## 相关链接\n`;
}

function addRelatedLink(body, link) {
  const next = ensureRelatedLinksSection(body);
  if (next.includes(link)) return next;
  return `${next.trimEnd()}\n- ${link}\n`;
}

function buildPageContent(frontmatter, title, sections) {
  const body = [
    `# ${title}`,
    '',
    sections.core || '## 核心内容\n',
    '',
    sections.recall || '## 召回条件\n',
    '',
    sections.links || '## 相关链接\n'
  ].join('\n');
  return `${formatFrontmatter(frontmatter)}\n${body.trim()}\n`;
}

function missingFrontmatterFields(data) {
  const missing = [];
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') missing.push(field);
  }
  return missing;
}

module.exports = {
  ROOT,
  WIKI,
  RAW,
  SOURCES,
  ARCHIVE,
  TEMP,
  INDEX_FILE,
  LOG_DIR,
  CATEGORY_DIRS,
  REQUIRED_FIELDS,
  ensureDir,
  ensureBaseDirs,
  walkMarkdown,
  getLocalDateString,
  getLocalTimeString,
  parseFrontmatter,
  formatFrontmatter,
  toSlug,
  hyphenTitle,
  wikiLinkFromPath,
  readMarkdown,
  writeMarkdown,
  appendLog,
  listWikiPages,
  inferCategoryFromText,
  extractTitle,
  upsertIndexEntry,
  listRawFiles,
  summarizeText,
  ensureRelatedLinksSection,
  addRelatedLink,
  buildPageContent,
  missingFrontmatterFields
};
