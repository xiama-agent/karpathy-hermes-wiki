// Find ALL PUA / non-printable chars in topic-gate file
const fs = require('fs');
const FILE = 'C:\\Users\\YANG\\AppData\\Local\\hermes\\plugins\\topic-gate\\__init__.py';

let content = fs.readFileSync(FILE, 'utf8');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

const counts = {};
for (const c of content) {
  const cp = c.codePointAt(0);
  if (cp >= 0xE000 && cp <= 0xF8FF) {
    counts[cp] = (counts[cp] || 0) + 1;
  } else if (cp < 0x20 && cp !== 0x0A && cp !== 0x0D && cp !== 0x09) {
    counts[cp] = (counts[cp] || 0) + 1;
  }
}

console.log('Invalid/non-printable chars:');
for (const [cp, n] of Object.entries(counts)) {
  console.log(`  U+${parseInt(cp).toString(16).toUpperCase().padStart(4, '0')}: ${n} occurrences`);
}
