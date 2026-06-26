// Detect and report ALL unterminated string literals in topic-gate file
const fs = require('fs');
const FILE = 'C:\\Users\\YANG\\AppData\\Local\\hermes\\plugins\\topic-gate\\__init__.py';

const { execSync } = require('child_process');
const py = 'C:\\Users\\YANG\\AppData\\Roaming\\uv\\python\\cpython-3.11-windows-x86_64-none\\python.exe';

// Find all "SyntaxError: unterminated string" lines
try {
  execSync(`"${py}" -c "import py_compile; py_compile.compile(r'${FILE}', doraise=True)"`, { encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  const err = e.stderr.toString();
  // Find lines with "unterminated string" or "EOL while scanning"
  const matches = err.matchAll(/line (\d+)/g);
  const lines = [...new Set([...matches].map(m => parseInt(m[1])))];
  console.log(`Problem lines: ${lines.join(', ')}`);

  // Print content of those lines
  const content = fs.readFileSync(FILE, 'utf8');
  const contentLines = content.split('\n');
  for (const ln of lines) {
    console.log(`--- L${ln} ---`);
    console.log(contentLines[ln - 1]);
  }
}
