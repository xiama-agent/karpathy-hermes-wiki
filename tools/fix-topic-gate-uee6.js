// Fix U+E6E6 invalid character bug in topic-gate __init__.py
// 7 occurrences. Replace with empty string (or space).

const fs = require('fs');
const FILE = 'C:\\Users\\YANG\\AppData\\Local\\hermes\\plugins\\topic-gate\\__init__.py';

let content = fs.readFileSync(FILE, 'utf8');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

const BEFORE = content.length;
const BAD_CHAR = String.fromCodePoint(0xE6E6);
let count = 0;
let newContent = '';
for (const c of content) {
  if (c === BAD_CHAR) {
    count++;
    // Replace with empty (or could be space)
  } else {
    newContent += c;
  }
}
console.log(`Removed ${count} U+E6E6 chars (file size: ${BEFORE} → ${newContent.length})`);

fs.writeFileSync(FILE, '\ufeff' + newContent, 'utf8');

// Verify
const { execSync } = require('child_process');
const py = 'C:\\Users\\YANG\\AppData\\Roaming\\uv\\python\\cpython-3.11-windows-x86_64-none\\python.exe';
try {
  const out = execSync(`"${py}" -c "import py_compile; py_compile.compile(r'${FILE}', doraise=True); print('OK')"`, { encoding: 'utf8' });
  console.log(out.trim());
} catch (e) {
  // Print error
  const errMsg = e.stderr ? e.stderr.toString() : e.message;
  console.error('STILL BROKEN:');
  console.error(errMsg);
  process.exit(1);
}
