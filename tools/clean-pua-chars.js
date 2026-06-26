// Clean ALL PUA characters from topic-gate __init__.py
const fs = require('fs');
const FILE = 'C:\\Users\\YANG\\AppData\\Local\\hermes\\plugins\\topic-gate\\__init__.py';

let content = fs.readFileSync(FILE, 'utf8');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

let removed = 0;
let newContent = '';
for (const c of content) {
  const cp = c.codePointAt(0);
  if ((cp >= 0xE000 && cp <= 0xF8FF) || (cp < 0x20 && cp !== 0x0A && cp !== 0x0D && cp !== 0x09)) {
    removed++;
  } else {
    newContent += c;
  }
}
console.log(`Removed ${removed} PUA/non-printable chars`);

fs.writeFileSync(FILE, '\ufeff' + newContent, 'utf8');
console.log(`File size: ${newContent.length} bytes`);

// Verify
const { execSync } = require('child_process');
const py = 'C:\\Users\\YANG\\AppData\\Roaming\\uv\\python\\cpython-3.11-windows-x86_64-none\\python.exe';
try {
  const out = execSync(`"${py}" -c "import py_compile; py_compile.compile(r'${FILE}', doraise=True); print('OK')"`, { encoding: 'utf8' });
  console.log(out.trim());
} catch (e) {
  console.error('STILL BROKEN:');
  console.error((e.stderr || e.message).toString());
  process.exit(1);
}
