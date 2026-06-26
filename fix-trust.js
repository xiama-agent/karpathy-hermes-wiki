// fix-trust.js — 统一 user_pref.md 的 trust 三值
// 策略：以 frontmatter 为权威，detail 字段和 heading 中的 trust 与 frontmatter 对齐

const fs = require('fs');
const path = require('path');

const file = 'D:\\ai_schedule\\hermes-brain\\wiki\\04-facts\\user_pref.md';
let content = fs.readFileSync(file, 'utf8');

// Extract frontmatter trust (authoritative)
const fmTrustMatch = content.match(/^trust:\s*([\d.]+)/m);
const fmTrust = fmTrustMatch ? parseFloat(fmTrustMatch[1]) : 0.5;
console.log(`[INFO] Frontmatter trust = ${fmTrust}`);

// Extract all individual fact blocks with their detail trust
const factPattern = /## HERMES-FACT-(\d+) \(trust:\s*([\d.]+)\)\s*\n\n([\s\S]*?)(?=\n## HERMES-FACT-|\n---\s*$)/g;
let modified = 0;
content = content.replace(factPattern, (match, factId, oldTrust, body) => {
  const oldT = parseFloat(oldTrust);
  // Use frontmatter trust as authoritative
  const newTrust = fmTrust.toFixed(2);

  // Update the detail field too (matches "- **trust**: 0.55" in list items)
  let newBody = body;
  newBody = newBody.replace(/(\*\*trust\*\*:\s*)([\d.]+)/g, `$1${newTrust}`);

  modified++;
  return `## HERMES-FACT-${factId} (trust: ${newTrust})\n\n${newBody}`;
});

fs.writeFileSync(file, content, 'utf8');
console.log(`[OK] ${modified} facts harmonized in user_pref.md`);
console.log(`[INFO] All facts now use trust = ${fmTrust}`);

// Verify: scan for any remaining mismatches
const verify = fs.readFileSync(file, 'utf8');
const facts = verify.match(/## HERMES-FACT-\d+ \(trust:\s*([\d.]+)\)/g) || [];
const details = (verify.match(/\*\*trust\*\*:\s*([\d.]+)/g) || []).map(s => s.match(/[\d.]+/)[0]);

console.log(`[VERIFY] ${facts.length} facts, ${details.length} detail trusts`);
const mismatches = facts.filter(f => {
  const t = f.match(/[\d.]+/)[0];
  return details.some(d => d !== t);
});
if (mismatches.length === 0) {
  console.log('[VERIFY] PASS: all facts and details match');
} else {
  console.log(`[VERIFY] FAIL: ${mismatches.length} mismatches remain`);
  console.log(mismatches.slice(0, 3));
}