const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

try {
  const output = execSync('find /usr/lib/code-server /usr/local /opt /home/coder -type f \\( -name "workbench.js" -o -name "workbench.web.main.js" -o -name "workbench.desktop.main.js" \\) 2>/dev/null').toString();
  const files = output.split('\n').filter(Boolean);
  
  const aiFabContent = fs.readFileSync('/tmp/ai_fab.js', 'utf8');

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('id="ai-fab"')) {
      // Append the script to the bottom of the workbench.js file
      fs.appendFileSync(file, '\n// --- ZERO HOUR AI INJECTION ---\n' + aiFabContent + '\n');
      console.log('Appended AI Chat Window script to ' + file);
    }
  });
} catch (e) {
  console.error('Failed to inject AI chat into workbench.js:', e);
}
