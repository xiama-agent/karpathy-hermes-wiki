// regenerate-user-pref.js — 重新生成 user_pref.md from fact_store_export.json
// 直接生成，trust 统一用 frontmatter 值（0.7）

const fs = require('fs');

const FACT_STORE = 'D:\\ai_schedule\\backup\\hermes-pre-wiki-rebuild-20260626-124508\\snapshot-baseline\\fact_store_export.json';
const TARGET = 'D:\\ai_schedule\\hermes-brain\\wiki\\04-facts\\user_pref.md';

const data = JSON.parse(fs.readFileSync(FACT_STORE, 'utf8'));
const userPrefFacts = data.filter(f => f.category === 'user_pref');
console.log(`Found ${userPrefFacts.length} user_pref facts`);

const TRUST = 0.70;  // 前一轮激活后的统一值

let content = `---
id: HERMES-FACT-USER_PREF-001
title: YANG 用户偏好 (${userPrefFacts.length} 条)
type: fact-collection
tags: [facts, user_pref]
trust: ${TRUST}
use_cases: ["查询 YANG 用户偏好类事实", "YANG 提到偏好相关"]
source: fact_store_export.json (备份) + manual activation 2026-06-26
last_updated: 2026-06-26
---

# YANG 用户偏好

> 来自 fact_store 全量导出，共 ${userPrefFacts.length} 条。按 fact_id 排序。
> **trust 统一为 ${TRUST}**（手动激活后所有 detail 字段一致）

---

`;

for (const f of userPrefFacts) {
  const cleaned = { ...f };
  delete cleaned.hrr_vector;
  content += `## HERMES-FACT-${String(cleaned.fact_id).padStart(3, '0')} (trust: ${TRUST})\n\n`;
  content += `${cleaned.content}\n\n`;
  content += `- **fact_id**: ${cleaned.fact_id}\n`;
  content += `- **category**: ${cleaned.category}\n`;
  content += `- **tags**: ${cleaned.tags}\n`;
  content += `- **trust**: ${TRUST}\n`;
  content += `- **retrieval_count**: ${cleaned.retrieval_count}\n`;
  content += `- **helpful_count**: ${cleaned.helpful_count}\n`;
  content += `- **created**: ${cleaned.created_at}\n`;
  content += `- **updated**: ${cleaned.updated_at}\n\n`;
  content += `---\n\n`;
}

// Append links
content += `## 相关链接

- [[general]]
- [[tool]]
- [[project]]
- [[preferences]]
`;

fs.writeFileSync(TARGET, content, 'utf8');
console.log(`[OK] ${TARGET} regenerated (${content.length} bytes, ${userPrefFacts.length} facts)`);

// Verify
const verify = fs.readFileSync(TARGET, 'utf8');
const facts = verify.match(/## HERMES-FACT-\d+ \(trust:\s*[\d.]+\)/g) || [];
const details = verify.match(/\*\*trust\*\*:\s*([\d.]+)/g) || [];
console.log(`[VERIFY] ${facts.length} facts, ${details.length} detail trusts`);
const fmTrustMatch = verify.match(/^trust:\s*([\d.]+)/m);
console.log(`[VERIFY] Frontmatter trust: ${fmTrustMatch[1]}`);