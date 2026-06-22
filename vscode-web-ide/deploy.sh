#!/bin/bash

# Zero Hour - Phase 2 EC2 Deployment Script
# Automatically configures Docker, Node.js, and PM2 for the AI-Native Assessment Engine

echo "========================================================"
echo "🚀 Starting Deployment of Zero Hour Engine (Phase 2)"
echo "========================================================"

# 1. INSTALL SYSTEM DEPENDENCIES
echo "🛠️ Installing dependencies (Docker, Node.js)..."
sudo apt update && sudo apt upgrade -y

# Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt install -y docker.io
    sudo usermod -aG docker ubuntu
    sudo systemctl enable docker
    sudo systemctl start docker
fi

# Node.js 20 LTS
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# 2. SET BASE PATH
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "📂 Repository root detected at: $REPO_ROOT"

# 3. BUILD THE CODE-SERVER DOCKER IMAGE
echo "🐳 Building the new code-server Docker image..."
cd "$REPO_ROOT/backend"
sudo docker build -t code-server-image .

# 4. PREPARE BACKEND & START PM2
echo "⚙️ Setting up Backend Server..."
npm install

echo "▶️ Launching Backend via PM2..."
# Kill any existing processes
pm2 delete zerohour-backend 2>/dev/null || true

# Start using the ecosystem config we created earlier
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | sudo bash

echo "========================================================"
echo "✅ Deployment built successfully!"
echo "Your Zero Hour backend is now running on Port 5000."
echo "Connect your Vercel frontend to this EC2 instance's IP."
echo "========================================================"
