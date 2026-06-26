// task-result.js — 任务结果自动回写
// 用法：node task-result.js --task-id "TASK-001" --result "result content"
// 功能：任务完成后自动回写结果到 Wiki

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const TASKS_DIR = 'D:\ai_schedule\tasks\mavis'; // Mavis 任务目录
const WIKI = path.join(ROOT, 'wiki');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { 
    taskId: '', 
    result: '', 
    discoveries: '', 
    deployment: '',
    wikiPage: '' 
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--task-id') {
      opts.taskId = args[++i] || '';
    } else if (args[i] === '--result') {
      opts.result = args[++i] || '';
    } else if (args[i] === '--discoveries') {
      opts.discoveries = args[++i] || '';
    } else if (args[i] === '--deployment') {
      opts.deployment = args[++i] || '';
    } else if (args[i] === '--wiki-page') {
      opts.wikiPage = args[++i] || '';
    }
  }
  
  return opts;
}

function updateTaskFile(taskId, resultInfo) {
  const taskFile = path.join(TASKS_DIR, `${taskId}.md`);
  
  if (!fs.existsSync(taskFile)) {
    console.error('❌ 任务文件不存在:', taskFile);
    return false;
  }
  
  const content = fs.readFileSync(taskFile, 'utf8');
  
  // 检查是否已有执行结果
  if (content.includes('## 执行结果')) {
    console.log('⚠️ 任务已有执行结果，将被覆盖');
  }
  
  // 构建执行结果章节
  const resultSection = `
## 执行结果

> 自动生成 by task-result.js
> 回写时间: ${new Date().toISOString().toLocaleString()}

### 输出
${resultInfo.result || '无输出'}

### 关键发现
${resultInfo.discoveries || '无新发现'}

### 实际部署路径
${resultInfo.deployment || '无部署文件'}

### Wiki 页面
${resultInfo.wikiPage ? `已创建: [[${resultInfo.wikiPage}]]` : '未创建 Wiki 页面'}

---
`;

  // 追加到任务文件
  const updatedContent = content + resultSection;
  
  try {
    fs.writeFileSync(taskFile, updatedContent, 'utf8');
    console.log('✅ 任务结果已回写到任务文件');
    console.log(`   文件: ${taskFile}`);
    return true;
  } catch (e) {
    console.error('❌ 任务结果回写失败:', e.message);
    return false;
  }
}

function extractKnowledgeFromResult(resultInfo) {
  const knowledgeItems = [];
  
  // 从发现中提取知识项
  if (resultInfo.discoveries) {
    const lines = resultInfo.discoveries.split(/[\n\r]+/);
    for (const line of lines) {
      const cleanLine = line.trim().replace(/^[-*]\s*/, '');
      if (cleanLine.length > 10) {
        knowledgeItems.push(cleanLine);
      }
    }
  }
  
  // 从部署路径中提取
  if (resultInfo.deployment) {
    const lines = resultInfo.deployment.split(/[\n\r]+/);
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length > 5 && (cleanLine.includes('\\') || cleanLine.includes('/'))) {
        knowledgeItems.push('路径: ' + cleanLine);
      }
    }
  }
  
  return knowledgeItems;
}

function createWikiPageFromResult(taskId, resultInfo) {
  if (!resultInfo.discoveries && !resultInfo.deployment) {
    console.log('⚠️ 没有足够内容创建 Wiki 页面');
    return null;
  }
  
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const pageId = `${taskId}-${dateStr}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  // 确定目标目录
  const targetDir = path.join(WIKI, '02-knowledge');
  const wikiFile = path.join(targetDir, `${pageId}.md`);
  
  // 构建内容
  const knowledgeItems = extractKnowledgeFromResult(resultInfo);
  
  let content = `---
id: HERMES-TASK-${taskId.toUpperCase()}
title: ${taskId} 任务结果
type: knowledge
tags: [task-result, automated]
trust: 0.4
use_cases: ["查询 ${taskId} 执行结果"]
source: task_result:${dateStr}:${taskId}
last_updated: ${dateStr}
---

# ${taskId} 任务结果

> 自动生成 by task-result.js
> 完成时间: ${now.toISOString().toLocaleString()}

## 执行输出

${resultInfo.result || '无输出'}

---

## 关键发现

`;

  if (knowledgeItems.length > 0) {
    knowledgeItems.forEach(item => {
      content += `- ${item}\n`;
    });
  } else {
    content += '无关键发现\n';
  }

  content += `
---

## 实际部署路径

${resultInfo.deployment || '无部署文件'}

---

## 任务信息

- **任务ID**: ${taskId}
- **回写时间**: ${dateStr}
- **来源**: task-result.js 自动生成
`;

  try {
    fs.writeFileSync(wikiFile, content, 'utf8');
    console.log('✅ Wiki 页面已创建');
    console.log(`   文件: ${wikiFile}`);
    return pageId;
  } catch (e) {
    console.error('❌ Wiki 页面创建失败:', e.message);
    return null;
  }
}

function updateIndex(taskId, wikiPageId) {
  const indexPath = path.join(ROOT, 'index.md');
  
  if (!fs.existsSync(indexPath)) {
    console.log('⚠️ index.md 不存在，跳过更新');
    return false;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  
  // 检查是否已存在
  if (content.includes(wikiPageId)) {
    console.log('⚠️ Wiki 页面已在 INDEX 中，跳过');
    return false;
  }
  
  // 找到 02-knowledge 分类
  const categoryMatch = content.match(/## 02-knowledge\s*\n([\s\S]*?)(?=##|$)/);
  
  if (categoryMatch) {
    const newEntry = `- [[wiki/02-knowledge/${wikiPageId}.md]] — ${taskId} 任务结果\n`;
    const updatedContent = content.replace(
      categoryMatch[0],
      categoryMatch[0].replace(/\n$/, '') + '\n' + newEntry
    );
    
    try {
      fs.writeFileSync(indexPath, updatedContent, 'utf8');
      console.log('✅ INDEX 已更新');
      return true;
    } catch (e) {
      console.error('❌ INDEX 更新失败:', e.message);
      return false;
    }
  }
  
  console.log('⚠️ 无法在 INDEX 中找到 02-knowledge 分类');
  return false;
}

function main() {
  const opts = parseArgs();
  
  if (opts.taskId === '') {
    console.log('用法:');
    console.log('  node task-result.js --task-id "TASK-001" --result "输出内容" --discoveries "发现内容"');
    console.log('');
    console.log('参数:');
    console.log('  --task-id: 任务ID (必需)');
    console.log('  --result: 执行输出');
    console.log('  --discoveries: 关键发现');
    console.log('  --deployment: 实际部署路径');
    console.log('  --wiki-page: 已创建的 Wiki 页面名称');
    process.exit(1);
  }
  
  console.log('📋 任务结果回写');
  console.log(`   任务ID: ${opts.taskId}`);
  console.log('');
  
  // 回写任务文件
  const resultInfo = {
    result: opts.result,
    discoveries: opts.discoveries,
    deployment: opts.deployment,
    wikiPage: opts.wikiPage
  };
  
  const taskSuccess = updateTaskFile(opts.taskId, resultInfo);
  
  // 如果没有指定 Wiki 页面，自动创建
  let wikiPageId = opts.wikiPage;
  if (!wikiPageId) {
    wikiPageId = createWikiPageFromResult(opts.taskId, resultInfo);
  }
  
  // 更新 INDEX
  if (wikiPageId) {
    updateIndex(opts.taskId, wikiPageId);
  }
  
  // 最终状态
  if (taskSuccess) {
    console.log('');
    console.log('🎉 任务结果回写完成');
  } else {
    console.log('');
    console.log('⚠️ 部分完成，但有错误');
    process.exit(1);
  }
}

main();
