const fs = require('fs');
const execSync = require('child_process').execSync;

try {
  const output = execSync('find /usr/lib/code-server /usr/local /opt /home/coder -type f \\( -name "workbench.html" -o -name "index.html" \\) 2>/dev/null').toString();
  const files = output.split('\n').filter(Boolean);
  
  const aiFabContent = fs.readFileSync('/tmp/ai_fab.js', 'utf8');

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // 1. NUKE the Content-Security-Policy completely from the HTML to allow our inline script!
    // This removes any <meta http-equiv="Content-Security-Policy" ... > tags
    content = content.replace(/<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');

    // 2. Inject the AI Fab inline script securely without CSP blocking us
    if (!content.includes('id="ai-fab"')) {
      const scriptTag = `\n<script>\n${aiFabContent}\n</script>\n</body>`;
      content = content.replace('</body>', scriptTag);
      fs.writeFileSync(file, content);
      console.log('Nuked CSP and Injected AI Chat Window script into ' + file);
    }
  });
} catch (e) {
  console.error('Failed to inject AI chat into workbench.html:', e);
}
