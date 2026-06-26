const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const WIKI = path.join(ROOT, 'wiki');
const FRESHNESS_FILE = path.join(ROOT, 'freshness.json');

function scanAllFiles() {
  const freshnessData = {};
  const now = new Date();
  
  function scanDir(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === '99-temp') continue;
      
      const fullPath = path.join(dir, entry.name);
      let relativePath = path.join(basePath, entry.name);
      relativePath = relativePath.replace(/\\/g, '/');
      
      if (entry.isDirectory()) {
        scanDir(fullPath, relativePath);
      } else if (entry.name.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const stat = fs.statSync(fullPath);
        
        const lastUpdatedMatch = content.match(/^last_updated:\s*(.+)$/m);
        const trustMatch = content.match(/^trust:\s*([\d.]+)$/m);
        const titleMatch = content.match(/^title:\s*(.+)$/m);
        
        const lastUpdated = lastUpdatedMatch ? new Date(lastUpdatedMatch[1]) : stat.mtime;
        const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
        
        let urgency = 'normal';
        if (daysSinceUpdate > 60) urgency = 'high';
        else if (daysSinceUpdate > 30) urgency = 'medium';
        
        const trust = trustMatch ? parseFloat(trustMatch[1]) : 0.5;
        if (trust < 0.3 && daysSinceUpdate > 30) urgency = 'high';
        
        freshnessData[relativePath] = {
          last_modified: stat.mtime.toISOString(),
          last_updated: lastUpdated.toISOString(),
          trust: trust,
          title: titleMatch ? titleMatch[1].trim() : entry.name.replace('.md', ''),
          urgency: urgency,
          days_since_update: daysSinceUpdate
        };
      }
    }
  }
  
  if (fs.existsSync(WIKI)) {
    scanDir(WIKI);
  }
  
  fs.writeFileSync(FRESHNESS_FILE, JSON.stringify(freshnessData, null, 2), 'utf8');
  return Object.keys(freshnessData).length;
}

function main() {
  const count = scanAllFiles();
  console.log('✅ 新鲜度追踪完成: ' + count + ' 个文件已记录');
  console.log('   数据文件: ' + FRESHNESS_FILE);
}

main();
