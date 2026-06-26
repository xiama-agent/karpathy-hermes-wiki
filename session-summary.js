// session-summary.js — 会话结束自动写日志
// 用法：node session-summary.js --topics "topic1, topic2" --files "file1.md, file2.md" --todos "todo1, todo2"
// 输出：写入到 wiki/01-yang/session-log/session-{date}-{time}.md

const fs = require('fs');
const path = require('path');
const { getLocalDateString, getLocalTimeString } = require('./wiki-utils');

const ROOT = path.resolve(__dirname);
const SESSION_DIR = path.join(ROOT, 'wiki', '01-yang', 'session-log');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { topics: '', files: '', todos: '' };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topics') {
      opts.topics = args[++i] || '';
    } else if (args[i] === '--files') {
      opts.files = args[++i] || '';
    } else if (args[i] === '--todos') {
      opts.todos = args[++i] || '';
    }
  }
  
  return opts;
}

function generateSessionId() {
  const dateStr = getLocalDateString();
  const timeStr = getLocalTimeString().replace(/:/g, '');
  return `session-${dateStr}-${timeStr}`;
}

function writeSessionSummary(opts) {
  // 确保目录存在
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }
  
  const sessionId = generateSessionId();
  const today = getLocalDateString();
  const filename = `${sessionId}.md`;
  const filepath = path.join(SESSION_DIR, filename);
  
  // 解析参数
  const topicsList = opts.topics ? opts.topics.split(',').map(t => t.trim()) : [];
  const filesList = opts.files ? opts.files.split(',').map(f => f.trim()) : [];
  const todosList = opts.todos ? opts.todos.split(',').map(t => t.trim()) : [];
  
  // 生成内容
  let content = `---\n`;
  content += `id: HERMES-SESSION-${sessionId}\n`;
  content += `title: 会话摘要 — ${sessionId}\n`;
  content += `type: session-log\n`;
  content += `tags: [session, summary]\n`;
  content += `trust: 0.8\n`;
  content += `source: session-summary.js\n`;
  content += `last_updated: ${today}\n`;
  content += `---\n\n`;
  content += `# 会话摘要 — ${sessionId}\n\n`;
  content += `> 自动生成 by session-summary.js\n`;
  content += `> 会话日期: ${today}\n`;
  content += `> 会话结束时间: ${getLocalTimeString()}\n\n`;
  content += `---\n\n`;
  
  // 涉及主题
  if (topicsList.length > 0) {
    content += `## 涉及主题\n\n`;
    topicsList.forEach(topic => {
      content += `- ${topic}\n`;
    });
    content += '\n';
  } else {
    content += `## 涉及主题\n\n- 无特定主题\n\n`;
  }
  
  // 修改的文件
  if (filesList.length > 0) {
    content += `## 修改的文件\n\n`;
    filesList.forEach(file => {
      content += `- \`${file}\`\n`;
    });
    content += '\n';
  } else {
    content += `## 修改的文件\n\n- 无文件修改\n\n`;
  }
  
  // 待办事项
  if (todosList.length > 0) {
    content += `## 待办事项\n\n`;
    todosList.forEach(todo => {
      content += `- [ ] ${todo}\n`;
    });
    content += '\n';
  } else {
    content += `## 待办事项\n\n- 无待办事项\n\n`;
  }
  
  // 元数据
  content += `---\n\n`;
  content += `**会话统计**:\n`;
  content += `- 主题数: ${topicsList.length}\n`;
  content += `- 文件修改数: ${filesList.length}\n`;
  content += `- 待办事项数: ${todosList.length}\n`;
  
  // 写入文件
  fs.writeFileSync(filepath, content, 'utf8');
  
  console.log('✅ 会话摘要已记录:');
  console.log(`   文件: ${path.relative(ROOT, filepath)}`);
  console.log(`   会话ID: ${sessionId}`);
  console.log(`   涉及主题: ${topicsList.length} 个`);
  console.log(`   文件修改: ${filesList.length} 个`);
  console.log(`   待办事项: ${todosList.length} 个`);
}

function main() {
  const opts = parseArgs();
  
  // 如果没有任何参数，仍然生成空摘要
  writeSessionSummary(opts);
}

main();
