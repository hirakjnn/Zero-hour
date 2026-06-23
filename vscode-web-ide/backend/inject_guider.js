const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const guiderScript = `
<script>
  window.addEventListener('DOMContentLoaded', () => {
    const guider = document.createElement('div');
    guider.id = 'ai-guider';
    guider.innerHTML = \`
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #007acc; box-shadow: 0 0 8px #007acc; animation: pulse 2s infinite;"></div>
        <strong style="color: #007acc;">Zero Hour AI:</strong>
        <span id="ai-guider-text">Initializing workspace...</span>
      </div>
    \`;
    const style = document.createElement('style');
    style.innerHTML = \`
      #ai-guider {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(30, 30, 30, 0.85);
        border: 1px solid #444;
        border-radius: 6px;
        padding: 10px 18px;
        color: #eee;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        z-index: 999999;
        box-shadow: 0 4px 16px rgba(0,0,0,0.6);
        backdrop-filter: blur(8px);
        pointer-events: none;
      }
      @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 122, 204, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 122, 204, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 122, 204, 0); }
      }
    \`;
    document.head.appendChild(style);
    document.body.appendChild(guider);
    
    setTimeout(() => {
      const textElement = document.getElementById('ai-guider-text');
      const text = "Welcome to Zero Hour. Open README.md to view your challenge instructions, and use the opencode CLI below to submit your solution.";
      let i = 0;
      textElement.innerHTML = '';
      const interval = setInterval(() => {
        textElement.innerHTML += text.charAt(i);
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 30);
    }, 1500);
  });
</script>
`;

try {
  const output = execSync('find /usr/lib/code-server /usr/local /opt /home/coder -type f \\( -name "workbench.html" -o -name "index.html" \\) 2>/dev/null').toString();
  const files = output.split('\n').filter(Boolean);
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('id="ai-guider"')) {
      content = content.replace('</body>', `\n${guiderScript}\n</body>`);
      fs.writeFileSync(file, content);
      console.log('Injected AI Guider into ' + file);
    }
  });
} catch (e) {
  console.error('Failed to inject AI guider:', e);
}
