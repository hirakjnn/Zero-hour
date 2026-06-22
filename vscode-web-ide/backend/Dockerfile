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

# Install OpenCode CLI
RUN curl -fsSL https://raw.githubusercontent.com/opencode-ai/opencode/refs/heads/main/install | bash

# Drop back to regular user
USER coder
