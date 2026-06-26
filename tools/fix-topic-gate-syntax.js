// Fix topic-gate __init__.py line 40 syntax bug
// The original line: "# ... ??? DANGEROUS_TOOLS = {" (all on one line)
// After #, everything is a comment, so DANGEROUS_TOOLS is never defined.
// Fix: split into two lines so DANGEROUS_TOOLS = { becomes a code statement.

const fs = require('fs');
const path = require('path');

const FILE = 'C:\\Users\\YANG\\AppData\\Local\\hermes\\plugins\\topic-gate\\__init__.py';

let content = fs.readFileSync(FILE, 'utf8');
// Strip BOM if present
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

const lines = content.split('\n');
let fixedCount = 0;
const newLines = lines.map((line, i) => {
  if (line.startsWith('#') && line.includes('DANGEROUS_TOOLS = {')) {
    const idx = line.indexOf('DANGEROUS_TOOLS = {');
    if (idx > 0) {
      const comment = line.slice(0, idx).replace(/\s+$/, '');
      fixedCount++;
      console.log(`Line ${i+1}: split into comment + code`);
      return comment;  // next iteration will see DANGEROUS_TOOLS on its own line if it was originally on this line
      // Actually DANGEROUS_TOOLS is still in the same line - return both
    }
  }
  // Also fix if a line is JUST the opening { of DANGEROUS_TOOLS that's stranded
  return line;
});

// Re-do: process all lines in one pass, splitting where needed
const finalLines = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trimStart().startsWith('#') && line.includes('DANGEROUS_TOOLS = {')) {
    const idx = line.indexOf('DANGEROUS_TOOLS = {');
    const comment = line.slice(0, idx).replace(/\s+$/, '');
    const code = 'DANGEROUS_TOOLS = {';
    finalLines.push(comment);
    finalLines.push(code);
    fixedCount++;
    console.log(`Split line ${i+1}: comment line + DANGEROUS_TOOLS line`);
  } else {
    finalLines.push(line);
  }
}

if (fixedCount === 0) {
  console.log('No fix needed (already split or not present)');
  process.exit(0);
}

const newContent = '\ufeff' + finalLines.join('\n');  // preserve BOM
fs.writeFileSync(FILE, newContent, 'utf8');
console.log(`Wrote ${FILE} (${newContent.length} bytes, ${fixedCount} fix(es))`);

// Verify syntax
const { execSync } = require('child_process');
try {
  execSync(`"${FILE.replace(/\\/g, '\\\\')}"`, { stdio: 'pipe' });
} catch (e) { /* file is not directly executable, that's expected */ }

// Use Python to compile-check
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
try {
  const out = execSync(`python -c "import py_compile; py_compile.compile(r'${FILE}', doraise=True); print('OK')"`, { encoding: 'utf8' });
  console.log(out.trim());
} catch (e) {
  console.error('Syntax check FAILED:', e.stderr || e.message);
  process.exit(1);
}
