function initAiFab() {
  if (document.getElementById('ai-fab')) return; // Prevent double initialization

  // 1. Hide the annoying 'insecure context' popup
  setInterval(() => {
    document.querySelectorAll('.notification-toast').forEach(toast => {
      if (toast.innerText && toast.innerText.toLowerCase().includes('insecure context')) {
        toast.style.display = 'none';
      }
    });
  }, 1000);

  // 2. Create the LLM Floating Action Button
  const fab = document.createElement('div');
  fab.id = 'ai-fab';
  fab.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  
  const chatWindow = document.createElement('div');
  chatWindow.id = 'ai-chat-window';
  chatWindow.style.display = 'none'; // explicitly initialize inline style
  chatWindow.innerHTML = `
    <div id="ai-chat-header">
      <strong>Zero Hour AI</strong>
      <button id="ai-chat-close">×</button>
    </div>
    <div id="ai-chat-history">
      <div class="ai-msg">Hi! I am the Zero Hour AI. How can I help you with this challenge?</div>
    </div>
    <div id="ai-chat-input-container">
      <input type="text" id="ai-chat-input" placeholder="Ask about the problem..." />
    </div>
  `;

  const style = document.createElement('style');
  style.innerHTML = `
    #ai-fab {
      position: fixed;
      bottom: 40px;
      right: 40px;
      width: 50px;
      height: 50px;
      background: #007acc;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 999999;
      transition: transform 0.2s;
    }
    #ai-fab:hover {
      transform: scale(1.1);
    }
    #ai-chat-window {
      position: fixed;
      bottom: 100px;
      right: 40px;
      width: 320px;
      height: 400px;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.7);
      display: none;
      flex-direction: column;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
    }
    #ai-chat-header {
      background: #252526;
      padding: 10px 15px;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #ddd;
      font-size: 14px;
    }
    #ai-chat-close {
      background: none;
      border: none;
      color: #aaa;
      font-size: 18px;
      cursor: pointer;
    }
    #ai-chat-close:hover {
      color: white;
    }
    #ai-chat-history {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 13px;
      color: #ccc;
    }
    .ai-msg {
      background: #2d2d2d;
      padding: 8px 12px;
      border-radius: 6px;
      align-self: flex-start;
      max-width: 85%;
      line-height: 1.4;
    }
    .user-msg {
      background: #007acc;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      align-self: flex-end;
      max-width: 85%;
      line-height: 1.4;
    }
    #ai-chat-input-container {
      padding: 10px;
      border-top: 1px solid #333;
      background: #252526;
    }
    #ai-chat-input {
      width: 100%;
      padding: 8px 10px;
      background: #3c3c3c;
      border: 1px solid #555;
      border-radius: 4px;
      color: white;
      outline: none;
      box-sizing: border-box;
    }
    #ai-chat-input:focus {
      border-color: #007acc;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(fab);
  document.body.appendChild(chatWindow);

  fab.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    if (chatWindow.style.display === 'flex') {
      setTimeout(() => document.getElementById('ai-chat-input').focus(), 50);
    }
  });

  document.getElementById('ai-chat-close').addEventListener('mousedown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    chatWindow.style.display = 'none';
  });

  const input = document.getElementById('ai-chat-input');
  const history = document.getElementById('ai-chat-history');

  let messageHistory = [];

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && input.value.trim() !== '') {
      const text = input.value.trim();
      input.value = '';
      input.disabled = true;

      // Add user message
      const userDiv = document.createElement('div');
      userDiv.className = 'user-msg';
      userDiv.textContent = text;
      history.appendChild(userDiv);
      history.scrollTop = history.scrollHeight;

      messageHistory.push({ role: 'user', content: text });

      // Add AI placeholder
      const aiDiv = document.createElement('div');
      aiDiv.className = 'ai-msg';
      aiDiv.textContent = '...';
      history.appendChild(aiDiv);
      history.scrollTop = history.scrollHeight;

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messageHistory
          })
        });

        if (!res.ok) throw new Error('Network error');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        aiDiv.textContent = '';
        let fullAiResponse = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (data.text) {
                  aiDiv.textContent += data.text;
                  fullAiResponse += data.text;
                  history.scrollTop = history.scrollHeight;
                }
              } catch(e) {}
            }
          }
        }
        
        messageHistory.push({ role: 'assistant', content: fullAiResponse });

      } catch (error) {
        aiDiv.textContent = 'Sorry, I am currently disconnected or there was an error.';
      } finally {
        input.disabled = false;
        input.focus();
      }
    }
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAiFab);
} else {
  initAiFab();
}
