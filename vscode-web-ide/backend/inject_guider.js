const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

try {
  const output = execSync('find /usr/lib/code-server /usr/local /opt /home/coder -type f \\( -name "workbench.html" -o -name "index.html" \\) 2>/dev/null').toString();
  const files = output.split('\n').filter(Boolean);
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('src="./ai_fab.js"')) {
      content = content.replace('</body>', '\n<script src="./ai_fab.js"></script>\n</body>');
      fs.writeFileSync(file, content);
      
      const dir = path.dirname(file);
      fs.copyFileSync('/tmp/ai_fab.js', path.join(dir, 'ai_fab.js'));
      
      console.log('Injected external AI Chat Window script into ' + file);
    }
  });
} catch (e) {
  console.error('Failed to inject AI chat:', e);
}
