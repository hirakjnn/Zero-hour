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
  
  const dialog = document.createElement('dialog');
  dialog.id = 'ai-chat-window';
  dialog.style.cssText = "width: 400px !important; height: 450px !important; background: #1e1e1e !important; border: 1px solid #444 !important; border-radius: 6px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.7) !important; padding: 0 !important; margin: auto !important; margin-top: 45px !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; overflow: hidden !important; color: #ccc !important;";
  
  // Using an inner wrapper to act as the flex container since dialog[open] inline styles can be tricky
  dialog.innerHTML = `
    <div id="ai-chat-wrapper" style="display: flex !important; flex-direction: column !important; height: 100% !important; width: 100% !important;">
      <div id="ai-chat-header" style="background: #252526 !important; padding: 10px 15px !important; border-bottom: 1px solid #333 !important; display: flex !important; justify-content: space-between !important; align-items: center !important; color: #ddd !important; font-size: 14px !important;">
        <strong>Zero Hour AI</strong>
        <button id="ai-chat-close" style="background: none !important; border: none !important; color: #aaa !important; font-size: 18px !important; cursor: pointer !important;">×</button>
      </div>
      <div id="ai-chat-history" style="flex: 1 !important; padding: 15px !important; overflow-y: auto !important; display: flex !important; flex-direction: column !important; gap: 10px !important; font-size: 13px !important; color: #ccc !important;">
        <div class="ai-msg" style="background: #2d2d2d !important; padding: 8px 12px !important; border-radius: 6px !important; align-self: flex-start !important; max-width: 85% !important; line-height: 1.4 !important;">Hi! I am the Zero Hour AI. How can I help you with this challenge?</div>
      </div>
      <div id="ai-chat-input-container" style="padding: 10px !important; border-top: 1px solid #333 !important; background: #252526 !important;">
        <input type="text" id="ai-chat-input" placeholder="Ask about the problem..." style="width: 100% !important; padding: 8px 10px !important; background: #3c3c3c !important; border: 1px solid #555 !important; border-radius: 4px !important; color: white !important; outline: none !important; box-sizing: border-box !important;" />
      </div>
    </div>
  `;

  // Apply FAB styling directly inline
  fab.style.cssText = "display: flex !important; align-items: center !important; gap: 6px !important; padding: 0 10px !important; height: 24px !important; background: #007acc !important; color: white !important; border-radius: 4px !important; cursor: pointer !important; font-size: 12px !important; margin-left: 10px !important; opacity: 0.9 !important; pointer-events: auto !important; z-index: 999999 !important;";

  fab.onmouseenter = () => fab.style.opacity = '1';
  fab.onmouseleave = () => fab.style.opacity = '0.9';

  // Inject into Titlebar Center (next to the search command center)
  const injectTimer = setInterval(() => {
    const titleCenter = document.querySelector('.titlebar-center') || document.querySelector('.part.titlebar');
    if (titleCenter && !document.getElementById('ai-fab')) {
      titleCenter.appendChild(fab);
      clearInterval(injectTimer);
    }
  }, 1000);

  const handleFabClick = (e) => {
    if (e.target && (e.target.id === 'ai-fab' || (typeof e.target.closest === 'function' && e.target.closest('#ai-fab')))) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Completely bypass VS Code DOM and CSS by opening a native popup window!
      window.open('/ai-chat', 'ZeroHourAI', 'width=450,height=550,menubar=no,toolbar=no,location=no,status=no');
    }
  };

  // Bind to all possible interactions on the highest possible capture level!
  ['mousedown', 'pointerdown', 'click', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, handleFabClick, true);
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAiFab);
} else {
  initAiFab();
}
