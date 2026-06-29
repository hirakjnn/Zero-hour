require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { spawn } = require('child_process');

const filesRouter = require('./routes/files');
const executeRouter = require('./routes/execute');
const aiRouter = require('./routes/ai');
const sessionRouter = require('./routes/session');
const submitRouter = require('./routes/submit');
const evaluationsRouter = require('./routes/evaluations');
const authRouter = require('./routes/auth');
const sessionManager = require('./services/SessionManager');
const { createProxyMiddleware } = require('http-proxy-middleware');
const httpProxy = require('http-proxy');


const rawWsProxy = httpProxy.createProxyServer({
    ws: true,
    changeOrigin: true,
    xfwd: true
});

rawWsProxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
    try {
        const port = options.target.port || new URL(options.target).port;
        proxyReq.setHeader('Origin', `http://127.0.0.1:${port}`);
    } catch(e) {}
});

rawWsProxy.on('error', (err, req, socket) => {
    console.error('[WS Proxy Error]', err.message);
    if (socket && !socket.destroyed) {
        socket.destroy();
    }
});

const app = express();
const server = http.createServer(app);

// Obsolete custom terminal removed

// CORS - allow frontend origin (supports hosting via env vars)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            callback(null, true); // allow all in dev; tighten in prod
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Standalone AI Chat UI Route (Bypasses VS Code entirely)
app.get('/ai-chat', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Zero Hour AI</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #1e1e1e;
          color: #ccc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        #ai-chat-header {
          background: #252526;
          padding: 15px;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #ddd;
          font-size: 16px;
        }
        #ai-chat-history {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 14px;
        }
        .ai-msg {
          background: #2d2d2d;
          padding: 10px 14px;
          border-radius: 6px;
          align-self: flex-start;
          max-width: 85%;
          line-height: 1.4;
        }
        .user-msg {
          background: #007acc;
          color: white;
          padding: 10px 14px;
          border-radius: 6px;
          align-self: flex-end;
          max-width: 85%;
          line-height: 1.4;
        }
        #ai-chat-input-container {
          padding: 15px;
          border-top: 1px solid #333;
          background: #252526;
        }
        #ai-chat-input {
          width: 100%;
          padding: 10px 12px;
          background: #3c3c3c;
          border: 1px solid #555;
          border-radius: 4px;
          color: white;
          outline: none;
          box-sizing: border-box;
          font-size: 14px;
        }
        #ai-chat-input:focus {
          border-color: #007acc;
        }
      </style>
    </head>
    <body>
      <div id="ai-chat-header">
        <strong>Zero Hour AI</strong>
        <button id="ai-chat-close" style="background: none; border: none; color: #aaa; font-size: 20px; cursor: pointer; padding: 0 5px;">×</button>
      </div>
      <div id="ai-chat-history">
        <div class="ai-msg">Hi! I am the Zero Hour AI. How can I help you with this challenge?</div>
      </div>
      <div id="ai-chat-input-container">
        <input type="text" id="ai-chat-input" placeholder="Ask about the problem... (Press Enter to send)" />
      </div>

      <script>
        const closeBtn = document.getElementById('ai-chat-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            window.parent.postMessage('close-ai-chat', '*');
          });
        }
        const input = document.getElementById('ai-chat-input');
        const history = document.getElementById('ai-chat-history');
        let messageHistory = [];

        input.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter' && input.value.trim() !== '') {
            const text = input.value.trim();
            input.value = '';
            input.disabled = true;

            const userDiv = document.createElement('div');
            userDiv.className = 'user-msg';
            userDiv.textContent = text;
            history.appendChild(userDiv);
            history.scrollTop = history.scrollHeight;

            messageHistory.push({ role: 'user', content: text });

            const aiDiv = document.createElement('div');
            aiDiv.className = 'ai-msg';
            aiDiv.textContent = '...';
            history.appendChild(aiDiv);
            history.scrollTop = history.scrollHeight;

            try {
              const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: messageHistory })
              });

              if (!res.ok) throw new Error('Network error');

              const reader = res.body.getReader();
              const decoder = new TextDecoder();
              aiDiv.textContent = '';
              let fullAiResponse = '';

              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\\n');
                
                for (const line of lines) {
                  if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                    try {
                      const data = JSON.parse(line.replace('data: ', ''));
                      if (data.text) {
                        aiDiv.textContent += data.text;
                        fullAiResponse += data.text;
                        history.scrollTop = history.scrollHeight;
                      }
                    } catch(err) {}
                  }
                }
              }
              messageHistory.push({ role: 'assistant', content: fullAiResponse });

            } catch (error) {
              aiDiv.textContent = 'Sorry, I am currently disconnected or there was an error.';
            } finally {
              input.disabled = false;
              input.focus();
            }
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Inject Session Middleware from frontend headers
app.use((req, res, next) => {
    const sessionId = req.headers['x-session-id'];
    if (sessionId) {
        req.session = sessionManager.getSession(sessionId);
        if (req.session) {
            sessionManager.touchSession(sessionId);
        }
    }
    next();
});

// Global persistent proxy instance for both HTTP and WebSockets
const previewProxy = createProxyMiddleware({
    target: 'http://127.0.0.1:32000', // Default dummy target
    router: (req) => {
        // Extract sessionId from URL (works for both HTTP and WebSocket reqs)
        const match = req.url.match(/^\/ide\/([a-zA-Z0-9]+)/);
        if (match) {
            const session = sessionManager.getSession(match[1]);
            if (session) return `http://127.0.0.1:${session.port}`;
        }
        return 'http://127.0.0.1:32000'; // Fallback to dead port if invalid
    },
    pathRewrite: (path, req) => {
        // MUST strip the path so code-server serves from / to prevent 'Not found.'
        return path.replace(/^\/ide\/[a-zA-Z0-9]+/, '');
    },
    changeOrigin: true,
    xfwd: true, // Crucial for code-server to understand proxy protocol/host
    onProxyRes: (proxyRes, req, res) => {
        // NUKE the CSP header completely from code-server responses
        // This allows our injected inline scripts in workbench.html to execute freely
        delete proxyRes.headers['content-security-policy'];
        delete proxyRes.headers['content-security-policy-report-only'];
    },
    onError: (err, req, res) => {
        console.error('[HTTP Proxy Error]', err.message);
        if (!res.headersSent) {
            res.status(502).send('Error 502: The IDE container crashed or is unreachable. Run docker ps to check.');
        }
    },
    logLevel: 'error'
});

// HTTP middleware to catch invalid sessions gracefully and enforce trailing slashes
app.use((req, res, next) => {
    if (req.url.startsWith('/ide/')) {
        const match = req.url.match(/^\/ide\/([a-zA-Z0-9]+)/);
        if (match) {
            const sessionId = match[1];
            const session = sessionManager.getSession(sessionId);
            if (!session) return res.status(404).send('Session expired or not found.');
            
            // Touch session to keep it alive
            sessionManager.touchSession(sessionId);

            // ENFORCE TRAILING SLASH (CRITICAL FOR CODE-SERVER SUBPATH ROUTING)
            // If the URL is exactly /ide/123, code-server returns "Not found."
            // It strictly requires /ide/123/
            try {
                const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                if (urlObj.pathname === `/ide/${sessionId}`) {
                    return res.redirect(`/ide/${sessionId}/${urlObj.search}`);
                }
            } catch(e) {}
        }
    }
    next();
});

// Apply proxy for HTTP traffic (Using raw app.use to prevent Express from stripping the /ide prefix)
app.use((req, res, next) => {
    if (req.url.startsWith('/preview')) {
        return res.redirect(req.url.replace('/preview', '/ide'));
    }
    if (req.url.startsWith('/ide')) {
        return previewProxy(req, res, next);
    }
    next();
});

// API routes
app.use('/api/session', sessionRouter);
app.use('/api/files', filesRouter);
app.use('/api/execute', executeRouter);
app.use('/api/ai', aiRouter);
app.use('/api/submit', submitRouter);
app.use('/api/evaluations', evaluationsRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket Upgrade Handler for Code-Server
server.on('upgrade', (req, socket, head) => {
    const match = req.url.match(/^\/ide\/([a-zA-Z0-9]+)/);
    if (match) {
        const sessionId = match[1];
        const session = sessionManager.getSession(sessionId);
        if (session) {
            // Touch session to keep it alive
            sessionManager.touchSession(sessionId);

            // Strip the /ide/123/ prefix so code-server gets the WebSocket at its root
            req.url = req.url.replace(/^\/ide\/[a-zA-Z0-9]+/, '');
            
            // Bypass http-proxy-middleware entirely and proxy the socket manually
            // This guarantees the dynamic port is respected and the dead-port bug is bypassed
            rawWsProxy.ws(req, socket, head, {
                target: `http://127.0.0.1:${session.port}`
            });
            return;
        }
    }
    // Drop invalid or missing sessions
    socket.destroy();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ VS Code Web IDE Backend running on port ${PORT}`);
    console.log(`   Workspace: ${process.env.WORKSPACE_DIR || path.join(__dirname, 'workspace')}`);
});


