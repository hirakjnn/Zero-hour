const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const execPromise = util.promisify(exec);

class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> { port, lastActive, containerName, workspaceDir }
    this.basePort = 32000;

    // Start the cleanup interval (every 5 minutes)
    setInterval(() => this.cleanupIdleSessions(), 5 * 60 * 1000);

    // Try to clear zombies on startup
    this.clearZombies();
  }

  async clearZombies() {
    try {
      console.log('[SessionManager] Clearing out any zombie ide-workspace containers...');
      const { stdout } = await execPromise('docker ps -a -q --filter "name=ide-workspace-"');
      const ids = stdout.trim().split('\n').filter(Boolean);
      if (ids.length > 0) {
        await execPromise(`docker rm -f ${ids.join(' ')}`);
        console.log(`[SessionManager] Removed ${ids.length} zombie containers.`);
      }
    } catch (e) {
      // ignore
    }
  }

  // Generate a unique session ID
  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Helper to test if a port is actually free on the host AND in docker
  async isPortFree(port) {
    try {
      // 1. Check if Node can bind to it
      const nodeFree = await new Promise(resolve => {
        const server = require('net').createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close(() => resolve(true));
        });
        server.listen(port, '0.0.0.0');
      });

      if (!nodeFree) return false;

      // 2. Check if Docker is using it (sometimes Docker holds it but allows Node to bind, or vice versa depending on iptables)
      const { stdout } = await execPromise(`docker ps --format "{{.Ports}}"`);
      if (stdout.includes(`:${port}->`)) {
        return false;
      }

      return true;
    } catch (e) {
      return false; // Safest to assume not free on error
    }
  }

  // Get the next available port for preview routing
  async getNextAvailablePort() {
    let port = this.basePort + Math.floor(Math.random() * 500) + 1; // Randomize start port to avoid rapid collision loops
    let attempts = 0;
    while (attempts < 1000) {
      const usedPorts = Array.from(this.sessions.values()).map(s => s.port);
      if (!usedPorts.includes(port)) {
        if (await this.isPortFree(port)) {
          return port;
        }
      }
      port = this.basePort + Math.floor(Math.random() * 1000) + 1; // Try another random port
      attempts++;
    }
    throw new Error("No free ports available after 1000 attempts");
  }


  // Initialize a new session
  async createSession(requestedSessionId = null, challengeId = null) {
    let sessionId = requestedSessionId;

    if (sessionId && this.sessions.has(sessionId)) {
      // Reattach to existing session
      const session = this.sessions.get(sessionId);
      session.lastActive = Date.now();
      return { sessionId, isNew: false, ...session };
    }

    // Create new session
    sessionId = sessionId || this.generateSessionId();
    const port = await this.getNextAvailablePort();
    const containerName = `ide-workspace-${sessionId.slice(0, 8)}`;

    // Create user's workspace directory
    const baseWorkspaceDir = process.env.WORKSPACE_DIR || path.join(__dirname, '../../workspaces');
    const userWorkspaceDir = path.join(baseWorkspaceDir, sessionId);

    // Create a central config dir for global settings and empty extensions masking
    const globalConfigDir = path.join(__dirname, '../../global_config');
    const emptyExtensionsDir = path.join(globalConfigDir, 'empty_extensions');
    const globalSettingsPath = path.join(globalConfigDir, 'settings.json');

    if (!fs.existsSync(globalConfigDir)) {
        fs.mkdirSync(globalConfigDir, { recursive: true });
        fs.mkdirSync(emptyExtensionsDir, { recursive: true });
        
        // This setting natively auto-allows tasks and disables the trust model safely!
        const globalSettings = {
            "task.allowAutomaticTasks": "on",
            "security.workspace.trust.enabled": false,
            "security.workspace.trust.startupPrompt": "never",
            "workbench.startupEditor": "none",
            "workbench.panel.opensMaximized": "always",
            "workbench.activityBar.visible": false,
            "chat.disableAIFeatures": true,
            "chat.editor.enable": false,
            "github.copilot.enable": false
        };
        fs.writeFileSync(globalSettingsPath, JSON.stringify(globalSettings, null, 2));
    }

    if (!fs.existsSync(userWorkspaceDir)) {
      fs.mkdirSync(userWorkspaceDir, { recursive: true });

      if (challengeId) {
        const challengeDir = path.join(__dirname, '../challenges', challengeId);
        if (fs.existsSync(challengeDir)) {
          fs.cpSync(challengeDir, userWorkspaceDir, { recursive: true });
        } else {
          console.warn(`[SessionManager] Challenge dir not found: ${challengeDir}`);
        }
      }

      // Inject VS Code settings for the specific workspace
      const vscodeDir = path.join(userWorkspaceDir, '.vscode');
      if (!fs.existsSync(vscodeDir)) {
          fs.mkdirSync(vscodeDir, { recursive: true });
      }
      
      const settingsJson = {
          "terminal.integrated.enableMultiLinePasteWarning": false,
          "workbench.panel.opensMaximized": "always"
      };
      fs.writeFileSync(path.join(vscodeDir, 'settings.json'), JSON.stringify(settingsJson, null, 2));

      const tasksJson = {
          "version": "2.0.0",
          "tasks": [
              {
                  "label": "OpenCode AI Assistant",
                  "type": "shell",
                  "command": "bash -i -c 'opencode'",
                  "presentation": {
                      "reveal": "always",
                      "panel": "new",
                      "focus": true,
                      "clear": true
                  },
                  "runOptions": {
                      "runOn": "folderOpen"
                  }
              }
          ]
      };
      fs.writeFileSync(path.join(vscodeDir, 'tasks.json'), JSON.stringify(tasksJson, null, 2));
    }

    const sessionData = {
      sessionId,
      port,
      containerName,
      workspaceDir: userWorkspaceDir,
      lastActive: Date.now()
    };

    this.sessions.set(sessionId, sessionData);

    // Spin up the Docker container
    try {
      // Stop/remove if a container with this name somehow exists
      await execPromise(`docker rm -f ${containerName}`).catch(() => { });

      // We volume mount the global settings file to OVERRIDE the container's User settings permanently.
      // We volume mount the empty extensions directory to MASK any pre-installed extensions in the image and block new ones.
      const cmd = `docker run -d --name ${containerName} -w /home/coder/project -e EXTENSIONS_GALLERY="{}" -e AUTH=none -v "${userWorkspaceDir}":/home/coder/project -v "${globalSettingsPath}":/home/coder/.local/share/code-server/User/settings.json -v "${emptyExtensionsDir}":/home/coder/.local/share/code-server/extensions:ro -p ${port}:8080 --user coder --memory="1024m" code-server-image --auth none --disable-telemetry /home/coder/project`;

      await execPromise(cmd);

      console.log(`[SessionManager] Created session ${sessionId} (Port: ${port})`);

      return { isNew: true, ...sessionData };
    } catch (e) {
      console.error(`[SessionManager] Failed to create container for ${sessionId}:`, e);
      this.sessions.delete(sessionId);
      throw e;
    }
  }

  // Ping session to keep it alive
  touchSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      session.lastActive = Date.now();
      return true;
    }
    return false;
  }

  // Get session details
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  // Destroy a session and its container
  async destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`[SessionManager] Destroying session ${sessionId}...`);

    try {
      await execPromise(`docker rm -f ${session.containerName}`);
    } catch (e) {
      console.error(`[SessionManager] Docker rm failed for ${session.containerName}:`, e);
    }

    this.sessions.delete(sessionId);
    console.log(`[SessionManager] Session ${sessionId} destroyed.`);
  }

  // Cleanup idle sessions (> 30 mins)
  async cleanupIdleSessions() {
    const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 mins
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActive > MAX_IDLE_TIME) {
        console.log(`[SessionManager] Session ${sessionId} timed out (idle).`);
        await this.destroySession(sessionId);
      }
    }
  }
}

// Export a singleton instance
const sessionManager = new SessionManager();
module.exports = sessionManager;
