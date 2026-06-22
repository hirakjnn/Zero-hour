FROM codercom/code-server:latest

USER root

# Install dependencies: Node.js, npm, Python3, pip, curl
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Drop back to regular user BEFORE installing OpenCode so it is placed in the coder user's home directory
USER coder

# Install OpenCode CLI
RUN curl -fsSL https://raw.githubusercontent.com/opencode-ai/opencode/refs/heads/main/install | bash
