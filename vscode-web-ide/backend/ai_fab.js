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

  // 2. Create the LLM Action Button for the Titlebar
  const fab = document.createElement('div');
  fab.id = 'ai-fab';
  fab.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span>Ask AI</span>
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
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      height: 24px;
      background: #007acc;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-left: 10px;
      opacity: 0.9;
      pointer-events: auto !important;
      z-index: 999999;
    }
    #ai-fab:hover {
      opacity: 1;
      background: #0098ff;
    }
    #ai-chat-window {
      position: absolute;
      top: 45px;
      left: 50%;
      transform: translateX(-50%);
      width: 400px;
      height: 450px;
      background: #1e1e1e;
      border: 1px solid #444;
      border-radius: 6px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.7);
      display: none;
      flex-direction: column;
      z-index: 99999999;
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
  document.body.appendChild(chatWindow);

  // Inject into Titlebar Center (next to the search command center)
  const injectTimer = setInterval(() => {
    // Attempt to find the center titlebar where the search window lives
    const titleCenter = document.querySelector('.titlebar-center') || document.querySelector('.part.titlebar');
    if (titleCenter && !document.getElementById('ai-fab')) {
      titleCenter.appendChild(fab);
      clearInterval(injectTimer);
    }
  }, 1000);

  // ULTIMATE EVENT INTERCEPTION
  // VS Code heavily uses capture-phase global event listeners to manage window focus, which swallows clicks before they reach elements.
  // By listening on the window during the capture phase (true), we guarantee we receive the event FIRST.
  const handleFabClick = (e) => {
    // Check if the user clicked the FAB or any of its children (like the SVG or span)
    if (e.target && (e.target.id === 'ai-fab' || e.target.closest('#ai-fab'))) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const isVisible = chatWindow.style.display === 'flex';
      chatWindow.style.display = isVisible ? 'none' : 'flex';
      
      if (!isVisible) {
        setTimeout(() => {
          const input = document.getElementById('ai-chat-input');
          if (input) input.focus();
        }, 50);
      }
    }
  };

  const handleCloseClick = (e) => {
    if (e.target && (e.target.id === 'ai-chat-close' || e.target.closest('#ai-chat-close'))) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      chatWindow.style.display = 'none';
    }
  };

  // Bind to all possible interactions on the highest possible capture level!
  ['mousedown', 'pointerdown', 'click', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, handleFabClick, true);
    window.addEventListener(evt, handleCloseClick, true);
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
