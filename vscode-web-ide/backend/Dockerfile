FROM codercom/code-server:latest

USER root

# Install dependencies: Node.js, npm, Python3, pip, curl, ripgrep, fzf
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    python3 \
    python3-pip \
    curl \
    ripgrep \
    fzf \
    && rm -rf /var/lib/apt/lists/*

# Install OpenCode CLI globally using npm (Recommended method, Node.js based)
RUN npm install -g opencode-ai

# (Reverted physical deletion of built-in extensions because removing core chat UI extensions crashes the VS Code workbench)

# Pre-create the directory structure so Docker doesn't create them as root during volume mounts!
RUN mkdir -p /home/coder/.local/share/code-server/User \
    && mkdir -p /home/coder/.local/share/code-server/extensions \
    && mkdir -p /home/coder/.local/share/opencode \
    && echo '{"workbench.colorTheme":"Default Dark Modern","workbench.iconTheme":"vs-seti","workbench.startupEditor":"none","workbench.activityBar.visible":true,"workbench.panel.opensMaximized":"always","task.allowAutomaticTasks":"on","security.workspace.trust.enabled":false,"security.workspace.trust.startupPrompt":"never","workbench.editor.empty.hint":"hidden","workbench.tips.enabled":false,"workbench.layoutControl.enabled":false,"workbench.parts.auxiliarybar.hidden":true,"chat.disableAIFeatures":true,"chat.editor.enable":false,"chat.commandCenter.enabled":false,"github.copilot.enable":false}' > /home/coder/.local/share/code-server/User/settings.json \
    && chown -R coder:coder /home/coder/.local

# Nuclear CSS Injection: Forcefully hide the Auxiliary Bar, all Chat UI elements, and the Extensions tab
RUN find /usr/lib/code-server /usr/local /opt /home/coder -type f \( -name "workbench.html" -o -name "index.html" \) 2>/dev/null | xargs -I {} sed -i 's|</head>|<style>.part.auxiliarybar, [id*="workbench.parts.auxiliarybar"], [aria-label*="Chat"], [id*="chat"], .chat-view, [aria-label*="Extensions"], [id*="workbench.view.extensions"] { display: none !important; opacity: 0 !important; pointer-events: none !important; width: 0 !important; overflow: hidden !important; position: absolute !important; left: -9999px !important; }</style></head>|' {} || true

COPY inject_guider.js /tmp/inject_guider.js
COPY ai_fab.js /tmp/ai_fab.js
RUN node /tmp/inject_guider.js

# Drop back to regular user for execution
USER coder
