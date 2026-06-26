
// Injected into code-server to provide the AI FAB
function initAiFab() {
  if (document.getElementById("ai-fab")) return; 

  const fab = document.createElement("div");
  fab.id = "ai-fab";
  fab.style.cssText = "display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; margin: 0 10px !important; padding: 5px 14px !important; background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%) !important; color: #ffffff !important; font-family: 'Inter', -apple-system, sans-serif !important; font-size: 13px !important; font-weight: 600 !important; border-radius: 20px !important; cursor: pointer !important; pointer-events: auto !important; position: relative !important; z-index: 2147483647 !important; box-shadow: 0 4px 15px rgba(0, 114, 255, 0.3) !important; text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important; transition: all 0.2s ease !important; border: 1px solid rgba(255,255,255,0.2) !important;";
  fab.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
  // Unique Glassmorphism UI
  mentorContainer.style.cssText = "display: none !important; flex-direction: column !important; position: fixed !important; top: 50px !important; right: 25px !important; width: 420px !important; height: 550px !important; background: rgba(15, 17, 26, 0.75) !important; backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 16px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset !important; z-index: 2147483647 !important; font-family: 'Inter', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif !important; overflow: hidden !important;";

  mentorContainer.innerHTML = `
    <div style="background: rgba(0, 0, 0, 0.2); padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; color: #ffffff; font-weight: 600; letter-spacing: 0.5px; font-size: 15px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #00c6ff; box-shadow: 0 0 10px #00c6ff;"></div>
        ZERO HOUR AI
      </div>
      <button id="ai-mentor-close-btn" style="background: none; border: none; color: rgba(255,255,255,0.5); font-size: 22px; cursor: pointer; transition: color 0.2s; padding: 0;">&times;</button>
    </div>
    <div id="ai-mentor-history" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; font-size: 14px; scroll-behavior: smooth;">
    </div>
    <div style="padding: 16px 20px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.08);">
      <input type="text" id="ai-mentor-input" placeholder="Ask your AI Mentor a question..." style="width: 100%; box-sizing: border-box; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #ffffff; border-radius: 12px; outline: none; font-family: inherit; font-size: 14px; transition: all 0.3s ease; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
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
      userDiv.style.cssText = "background: linear-gradient(135deg, #0072ff 0%, #00c6ff 100%); padding: 12px 16px; border-radius: 16px; border-bottom-right-radius: 4px; align-self: flex-end; max-width: 85%; color: #ffffff; line-height: 1.5; font-weight: 500; box-shadow: 0 4px 15px rgba(0, 114, 255, 0.2);";
      userDiv.textContent = text;
      history.appendChild(userDiv);
      history.scrollTop = history.scrollHeight;
      messageHistory.push({ role: "user", content: text });
    }

    const aiDiv = document.createElement("div");
    aiDiv.style.cssText = "background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px 18px; border-radius: 16px; border-top-left-radius: 4px; border: 1px solid rgba(0, 198, 255, 0.2); align-self: flex-start; max-width: 90%; color: #f8fafc; line-height: 1.6; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-size: 14.5px;";
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

