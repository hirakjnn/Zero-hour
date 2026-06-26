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

  // Apply FAB styling directly inline with extreme z-index and explicit positioning
  fab.style.cssText = "display: flex !important; align-items: center !important; gap: 6px !important; padding: 0 10px !important; height: 24px !important; background: #007acc !important; color: white !important; border-radius: 4px !important; cursor: pointer !important; font-size: 12px !important; margin-left: 10px !important; opacity: 0.9 !important; pointer-events: auto !important; position: relative !important; z-index: 2147483647 !important;";
  fab.onmouseenter = () => fab.style.opacity = '1';
  fab.onmouseleave = () => fab.style.opacity = '0.9';

  // Inject into Titlebar Center along with a 1-hour Timer
  const injectTimer = setInterval(() => {
    const titleCenter = document.querySelector('.titlebar-center') || document.querySelector('.part.titlebar');
    if (titleCenter && !document.getElementById('ai-fab')) {
      // Create Timer Element that persists across reloads using sessionStorage, scoped to the session ID
      const timerDiv = document.createElement('div');
      timerDiv.id = 'session-timer';
      timerDiv.style.cssText = "color: #ff5555; font-family: monospace; font-size: 14px; margin-right: 15px; display: flex; align-items: center; font-weight: bold;";
      
      // Extract session ID from the URL (e.g., /ide/1234abc/)
      const pathParts = window.location.pathname.split('/');
      const sessionId = (pathParts[1] === 'ide' && pathParts[2]) ? pathParts[2] : 'default';
      
      const timerKey = `zero_hour_session_end_${sessionId}`;
      let endTime = sessionStorage.getItem(timerKey);
      if (!endTime) {
        endTime = Date.now() + 3600 * 1000; // 1 hour from now
        sessionStorage.setItem(timerKey, endTime);
      }

      setInterval(() => {
        const timeLeft = Math.floor((endTime - Date.now()) / 1000);
        if(timeLeft < 0) {
          timerDiv.innerText = "00:00";
          timerDiv.style.color = "red";
          return;
        }
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        timerDiv.innerText = `${m}:${s} left`;
      }, 1000);

      titleCenter.appendChild(timerDiv);
      titleCenter.appendChild(fab);
      clearInterval(injectTimer);
    }
  }, 1000);

  // 3. Create the Native DOM Chat UI (No Iframes!)
  const chatContainer = document.createElement('div');
  chatContainer.id = 'ai-chat-container';
  chatContainer.style.cssText = "position: absolute !important; top: 40px !important; right: 20px !important; width: 420px !important; height: 550px !important; border: 1px solid #444 !important; border-radius: 8px !important; box-shadow: 0 10px 40px rgba(0,0,0,0.9) !important; z-index: 2147483647 !important; display: none !important; background: #1e1e1e !important; flex-direction: column !important; overflow: hidden !important; color: #ccc !important; font-family: sans-serif !important;";

  chatContainer.innerHTML = `
    <div style="background: #252526; padding: 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; color: #ddd; font-weight: bold;">
      Zero Hour AI
      <button id="ai-chat-close-btn" style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer;">&times;</button>
    </div>
    <div id="ai-chat-history" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
      <div style="background: #2d2d2d; padding: 10px 14px; border-radius: 8px; align-self: flex-start; max-width: 85%; line-height: 1.4;">
        Welcome to the War Room. I am your AI Mentor. Describe the problem you are facing, and I will guide you to a solution without writing the code for you.
      </div>
    </div>
    <div style="padding: 15px; background: #252526; border-top: 1px solid #333;">
      <input type="text" id="ai-chat-input" placeholder="Ask AI a question..." style="width: 100%; box-sizing: border-box; padding: 10px 14px; background: #3c3c3c; border: 1px solid #555; color: #fff; border-radius: 6px; outline: none;">
    </div>
  `;

  const injectChatTimer = setInterval(() => {
    const workbench = document.querySelector('.monaco-workbench') || document.body;
    if (workbench && !document.getElementById('ai-chat-container')) {
      workbench.appendChild(chatContainer);
      clearInterval(injectChatTimer);
      
      // Bind Chat Logic
      const input = chatContainer.querySelector('#ai-chat-input');
      const history = chatContainer.querySelector('#ai-chat-history');
      let messageHistory = [];

      chatContainer.querySelector('#ai-chat-close-btn').onclick = () => {
        chatContainer.style.setProperty('display', 'none', 'important');
        isChatOpen = false;
      };

      input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
          const text = input.value.trim();
          input.value = '';
          input.disabled = true;

          const userDiv = document.createElement('div');
          userDiv.style.cssText = "background: #007acc; padding: 10px 14px; border-radius: 8px; align-self: flex-end; max-width: 85%; color: white; line-height: 1.4;";
          userDiv.textContent = text;
          history.appendChild(userDiv);
          history.scrollTop = history.scrollHeight;
          messageHistory.push({ role: 'user', content: text });

          const aiDiv = document.createElement('div');
          aiDiv.style.cssText = "background: #2d2d2d; padding: 10px 14px; border-radius: 8px; align-self: flex-start; max-width: 85%; line-height: 1.4;";
          aiDiv.textContent = '...';
          history.appendChild(aiDiv);
          history.scrollTop = history.scrollHeight;

          // Attempt to extract live context from the VS Code editor DOM
          let currentCodeContext = "No file currently focused.";
          try {
            const editorLines = document.querySelector('.monaco-editor .view-lines');
            if (editorLines) {
               currentCodeContext = editorLines.innerText || "Empty file.";
            }
          } catch(err) {}

          try {
            const res = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                message: text, 
                history: messageHistory,
                code: currentCodeContext // Inject live context so the AI "knows what the user is doing"
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
                  } catch(err) {}
                }
              }
            }
            messageHistory.push({ role: 'assistant', content: fullAiResponse });
          } catch (error) {
            aiDiv.textContent = 'Connection failed. Ensure the backend is running.';
          } finally {
            input.disabled = false;
            input.focus();
          }
        }
      });
    }
  }, 1000);

  let isChatOpen = false;

  const toggleChat = () => {
    if (!isChatOpen) {
      chatContainer.style.setProperty('display', 'flex', 'important');
      isChatOpen = true;
    } else {
      chatContainer.style.setProperty('display', 'none', 'important');
      isChatOpen = false;
    }
  };

  // The CORE FIX: VS Code's titlebar is a draggable region that uses window-level or 
  // container-level capture listeners to aggressively swallow events for dragging.
  // We MUST attach our listener to the very top (window) during the capture phase
  // so we intercept it BEFORE VS Code's layout engines can stop propagation!
  window.addEventListener('mousedown', (e) => {
    const fabTarget = e.target.closest('#ai-fab');
    if (fabTarget) {
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
    }
  }, true);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAiFab);
} else {
  initAiFab();
}
