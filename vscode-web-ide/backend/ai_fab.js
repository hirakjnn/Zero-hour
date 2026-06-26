
// Injected into code-server to provide the AI FAB
function initAiFab() {
  if (document.getElementById("ai-fab")) return; 

  const fab = document.createElement("div");
  fab.id = "ai-fab";
  fab.style.cssText = "display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; margin: 0 10px !important; padding: 4px 12px !important; background: #007acc !important; color: white !important; font-family: sans-serif !important; font-size: 13px !important; font-weight: bold !important; border-radius: 4px !important; cursor: pointer !important; pointer-events: auto !important; position: relative !important; z-index: 2147483647 !important;";
  fab.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span>Ask AI</span>
  `;
  
  const timerDiv = document.createElement("div");
  timerDiv.id = "ai-timer";
  timerDiv.style.cssText = "display: flex !important; align-items: center !important; justify-content: center !important; margin: 0 5px !important; padding: 4px 12px !important; background: #333 !important; color: #ffcc00 !important; font-family: monospace !important; font-size: 13px !important; font-weight: bold !important; border-radius: 4px !important; border: 1px solid #555 !important; z-index: 2147483647 !important;";
  
  const updateTimer = () => {
    const sessionId = window.location.pathname.split("/ide/")[1]?.replace(/\/$/, "");
    if (!sessionId) return;
    const sessionKey = "sessionStartTime_" + sessionId;
    let startTime = sessionStorage.getItem(sessionKey);
    if (!startTime) {
      startTime = Date.now();
      sessionStorage.setItem(sessionKey, startTime);
    }
    const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
    const remaining = Math.max(3600 - elapsed, 0);
    const m = Math.floor(remaining / 60).toString().padStart(2, "0");
    const s = (remaining % 60).toString().padStart(2, "0");
    timerDiv.innerText = `${m}:${s}`;
    if (remaining === 0) {
      timerDiv.style.color = "#ff4444";
      timerDiv.innerText = "TIME UP";
    }
  };
  setInterval(updateTimer, 1000);
  updateTimer();

  const injectTimer = setInterval(() => {
    const titleCenter = document.querySelector(".titlebar-center") || document.querySelector(".part.titlebar");
    if (titleCenter && !document.getElementById("ai-fab")) {
      titleCenter.appendChild(timerDiv);
      titleCenter.appendChild(fab);
      clearInterval(injectTimer);
    }
  }, 1000);

  const mentorContainer = document.createElement("div");
  mentorContainer.id = "ai-mentor-container";
  mentorContainer.style.cssText = "display: none !important; flex-direction: column !important; position: fixed !important; top: 40px !important; right: 20px !important; width: 400px !important; height: 500px !important; background: #1e1e1e !important; border: 1px solid #333 !important; border-radius: 8px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important; z-index: 2147483647 !important; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif !important;";

  mentorContainer.innerHTML = `
    <div style="background: #252526; padding: 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; color: #ddd; font-weight: bold;">
      Zero Hour AI
      <button id="ai-mentor-close-btn" style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer;">&times;</button>
    </div>
    <div id="ai-mentor-history" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; font-size: 14px; scroll-behavior: smooth;">
    </div>
    <div style="padding: 15px; background: #252526; border-top: 1px solid #333;">
      <input type="text" id="ai-mentor-input" placeholder="Ask your AI Mentor a question..." style="width: 100%; box-sizing: border-box; padding: 10px 14px; background: #3c3c3c; border: 1px solid #555; color: #fff; border-radius: 6px; outline: none; font-family: inherit; font-size: 14px;">
    </div>
  `;

  const injectMentorTimer = setInterval(() => {
    const workbench = document.querySelector(".monaco-workbench") || document.body;
    if (workbench && !document.getElementById("ai-mentor-container")) {
      workbench.appendChild(mentorContainer);
      clearInterval(injectMentorTimer);
      
      const input = document.getElementById("ai-mentor-input");
      document.getElementById("ai-mentor-close-btn").onclick = () => {
        mentorContainer.style.setProperty("display", "none", "important");
        isMentorOpen = false;
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && input.value.trim() !== "") {
          triggerAI(input.value.trim());
        }
      });
    }
  }, 1000);

  let isMentorOpen = false;
  let hasTriggeredInitialAnalysis = false;
  let messageHistory = [];

  const triggerAI = async (text) => {
    const input = document.getElementById("ai-mentor-input");
    const history = document.getElementById("ai-mentor-history");
    
    input.value = "";
    input.disabled = true;

    if (text) {
      const userDiv = document.createElement("div");
      userDiv.style.cssText = "background: #007acc; padding: 10px 14px; border-radius: 8px; align-self: flex-end; max-width: 85%; color: white; line-height: 1.4;";
      userDiv.textContent = text;
      history.appendChild(userDiv);
      history.scrollTop = history.scrollHeight;
      messageHistory.push({ role: "user", content: text });
    }

    const aiDiv = document.createElement("div");
    aiDiv.style.cssText = "background: #2d2d2d; padding: 10px 14px; border-radius: 8px; align-self: flex-start; max-width: 85%; line-height: 1.4; color: #f8fafc;";
    aiDiv.textContent = "...";
    history.appendChild(aiDiv);
    history.scrollTop = history.scrollHeight;

    let currentCodeContext = "No file currently focused.";
    try {
      const editorLines = document.querySelector(".monaco-editor .view-lines");
      if (editorLines) {
          currentCodeContext = editorLines.innerText || "Empty file.";
      }
    } catch(err) {}

    try {
      const payloadMessage = text || "Please analyze my current code and give me a hint about what I should do next.";
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: payloadMessage, 
          history: messageHistory,
          code: currentCodeContext
        })
      });

      if (!res.ok) throw new Error("Network error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      aiDiv.textContent = "";
      let fullAiResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              if (data.text) {
                aiDiv.textContent += data.text;
                fullAiResponse += data.text;
                history.scrollTop = history.scrollHeight;
              }
            } catch(err) {}
          }
        }
      }
      messageHistory.push({ role: "assistant", content: fullAiResponse });
    } catch (error) {
      aiDiv.textContent = "Connection failed. Ensure the backend is running.";
    } finally {
      input.disabled = false;
      input.focus();
    }
  };

  const toggleMentor = () => {
    const mc = document.getElementById("ai-mentor-container");
    if (!isMentorOpen) {
      mc.style.setProperty("display", "flex", "important");
      isMentorOpen = true;
      if (!hasTriggeredInitialAnalysis) {
        hasTriggeredInitialAnalysis = true;
        triggerAI(""); 
      }
    } else {
      mc.style.setProperty("display", "none", "important");
      isMentorOpen = false;
    }
  };

  window.addEventListener("mousedown", (e) => {
    const fabTarget = e.target.closest("#ai-fab");
    if (fabTarget) {
      e.preventDefault();
      e.stopPropagation();
      toggleMentor();
    }
  }, true);
}
initAiFab();

