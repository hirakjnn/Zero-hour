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

  // Apply FAB styling directly inline
  fab.style.cssText = "display: flex !important; align-items: center !important; gap: 6px !important; padding: 0 10px !important; height: 24px !important; background: #007acc !important; color: white !important; border-radius: 4px !important; cursor: pointer !important; font-size: 12px !important; margin-left: 10px !important; opacity: 0.9 !important; pointer-events: auto !important; z-index: 999999 !important;";
  fab.onmouseenter = () => fab.style.opacity = '1';
  fab.onmouseleave = () => fab.style.opacity = '0.9';

  // Inject into Titlebar Center
  const injectTimer = setInterval(() => {
    const titleCenter = document.querySelector('.titlebar-center') || document.querySelector('.part.titlebar');
    if (titleCenter && !document.getElementById('ai-fab')) {
      titleCenter.appendChild(fab);
      clearInterval(injectTimer);
    }
  }, 1000);

  // 3. Create the Iframe Container for the Chat UI
  // Using an iframe perfectly isolates our Chat UI from VS Code's aggressive CSS/DOM sandbox
  const chatIframe = document.createElement('iframe');
  chatIframe.id = 'ai-chat-iframe';
  chatIframe.src = '/ai-chat';
  chatIframe.style.cssText = "position: absolute !important; top: 40px !important; right: 20px !important; width: 420px !important; height: 550px !important; border: 1px solid #444 !important; border-radius: 8px !important; box-shadow: 0 10px 40px rgba(0,0,0,0.9) !important; z-index: 2147483647 !important; display: none !important; background: #1e1e1e !important;";

  let isChatOpen = false;

  const toggleChat = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isChatOpen) {
      // Force append to the main workbench container to guarantee visibility
      const workbench = document.querySelector('.monaco-workbench') || document.body;
      if (chatIframe.parentNode !== workbench) {
        workbench.appendChild(chatIframe);
      }
      chatIframe.style.setProperty('display', 'block', 'important');
      isChatOpen = true;
    } else {
      chatIframe.style.setProperty('display', 'none', 'important');
      isChatOpen = false;
    }
  };

  fab.addEventListener('mousedown', toggleChat);
  fab.addEventListener('click', toggleChat);
  fab.addEventListener('touchstart', toggleChat);

  // Allow the iframe to close itself if it wants to communicate via postMessage
  window.addEventListener('message', (event) => {
    if (event.data === 'close-ai-chat') {
      chatIframe.style.setProperty('display', 'none', 'important');
      isChatOpen = false;
    }
  });;
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAiFab);
} else {
  initAiFab();
}
