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
  
  // Rebuild the floating Chat UI as a standard DIV, fully styled inline to bypass CSP <style> tag blocking
  const chatWindow = document.createElement('div');
  chatWindow.id = 'ai-chat-window';
  chatWindow.style.cssText = "position: fixed !important; top: 50px !important; right: 20px !important; width: 400px !important; height: 500px !important; background: #1e1e1e !important; border: 1px solid #444 !important; border-radius: 8px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important; display: none !important; flex-direction: column !important; z-index: 2147483647 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; overflow: hidden !important; color: #ccc !important;";

  chatWindow.innerHTML = `
    <div id="ai-chat-header" style="background: #252526 !important; padding: 12px 16px !important; border-bottom: 1px solid #333 !important; display: flex !important; justify-content: space-between !important; align-items: center !important; color: #ddd !important; font-size: 15px !important; font-weight: bold !important; user-select: none !important; cursor: move !important;">
      <span>Zero Hour AI</span>
      <button id="ai-chat-close" style="background: none !important; border: none !important; color: #aaa !important; font-size: 20px !important; cursor: pointer !important; padding: 0 5px !important;">×</button>
    </div>
    <div id="ai-chat-history" style="flex: 1 !important; padding: 15px !important; overflow-y: auto !important; display: flex !important; flex-direction: column !important; gap: 12px !important; font-size: 13px !important; color: #ccc !important;">
      <div class="ai-msg" style="background: #2d2d2d !important; padding: 10px 14px !important; border-radius: 6px !important; align-self: flex-start !important; max-width: 85% !important; line-height: 1.4 !important; box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;">Hi! I am the Zero Hour AI. How can I help you with this challenge?</div>
    </div>
    <div id="ai-chat-input-container" style="padding: 12px !important; border-top: 1px solid #333 !important; background: #252526 !important; display: flex !important;">
      <input type="text" id="ai-chat-input" placeholder="Ask about the problem..." style="flex: 1 !important; width: 100% !important; padding: 10px 12px !important; background: #3c3c3c !important; border: 1px solid #555 !important; border-radius: 4px !important; color: white !important; outline: none !important; box-sizing: border-box !important; font-size: 13px !important;" />
    </div>
  `;

  // Apply FAB styling directly inline
  fab.style.cssText = "display: flex !important; align-items: center !important; gap: 6px !important; padding: 0 10px !important; height: 24px !important; background: #007acc !important; color: white !important; border-radius: 4px !important; cursor: pointer !important; font-size: 12px !important; margin-left: 10px !important; opacity: 0.9 !important; pointer-events: auto !important; z-index: 999999 !important;";

  fab.onmouseenter = () => fab.style.opacity = '1';
  fab.onmouseleave = () => fab.style.opacity = '0.9';

  // Inject into Body safely
  setInterval(() => {
    if (!document.getElementById('ai-chat-window')) {
      document.body.appendChild(chatWindow);
    }
  }, 1000);

  // Inject into Titlebar Center (next to the search command center)
  const injectTimer = setInterval(() => {
    const titleCenter = document.querySelector('.titlebar-center') || document.querySelector('.part.titlebar');
    if (titleCenter && !document.getElementById('ai-fab')) {
      titleCenter.appendChild(fab);
      clearInterval(injectTimer);
    }
  }, 1000);

  let isChatOpen = false;

  // Bind directly to the FAB instead of using global window capture
  const toggleChat = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isChatOpen) {
      chatWindow.style.setProperty('display', 'flex', 'important');
      isChatOpen = true;
      setTimeout(() => {
        const input = document.getElementById('ai-chat-input');
        if (input) input.focus();
      }, 50);
    } else {
      chatWindow.style.setProperty('display', 'none', 'important');
      isChatOpen = false;
    }
  };

  fab.addEventListener('mousedown', toggleChat);
  fab.addEventListener('click', toggleChat);
  fab.addEventListener('touchstart', toggleChat);

  const closeBtn = chatWindow.querySelector('#ai-chat-close');
  if (closeBtn) {
    const closeChat = (e) => {
      e.preventDefault();
      e.stopPropagation();
      chatWindow.style.setProperty('display', 'none', 'important');
      isChatOpen = false;
    };
    closeBtn.addEventListener('mousedown', closeChat);
    closeBtn.addEventListener('click', closeChat);
    closeBtn.addEventListener('touchstart', closeChat);
  }

  const input = chatWindow.querySelector('#ai-chat-input');
  const history = chatWindow.querySelector('#ai-chat-history');

  let messageHistory = [];

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && input.value.trim() !== '') {
      const text = input.value.trim();
      input.value = '';
      input.disabled = true;

      // Add user message
      const userDiv = document.createElement('div');
      userDiv.style.cssText = "background: #007acc !important; color: white !important; padding: 10px 14px !important; border-radius: 6px !important; align-self: flex-end !important; max-width: 85% !important; line-height: 1.4 !important; box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;";
      userDiv.textContent = text;
      history.appendChild(userDiv);
      history.scrollTop = history.scrollHeight;

      messageHistory.push({ role: 'user', content: text });

      // Add AI placeholder
      const aiDiv = document.createElement('div');
      aiDiv.style.cssText = "background: #2d2d2d !important; padding: 10px 14px !important; border-radius: 6px !important; align-self: flex-start !important; max-width: 85% !important; line-height: 1.4 !important; color: #ccc !important; box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;";
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
          const lines = chunk.split('\\n');
          
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
