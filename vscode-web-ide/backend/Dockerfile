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

# Install OpenCode CLI globally using npm (this ensures the agent component is correctly bundled)
RUN npm install -g opencode-ai

# Drop back to regular user for execution
USER coder
