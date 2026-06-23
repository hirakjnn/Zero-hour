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

            // NUCLEAR CACHE BUSTING: Force the browser to violently delete its IndexedDB and LocalStorage.
            // This guarantees any zombie extensions (like Copilot Chat) cached by the Service Worker are permanently destroyed.
            res.setHeader('Clear-Site-Data', '"cache", "storage", "executionContexts"');

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

// Scale-to-Zero heartbeat
let zeroSessionsTime = 0;
setInterval(() => {
    const activeSessionsCount = sessionManager.sessions.size;
    if (activeSessionsCount === 0) {
        zeroSessionsTime += 1;
        console.log(`[Scale-to-Zero] 0 active sessions for ${zeroSessionsTime} minute(s).`);
        if (zeroSessionsTime >= 15) {
            console.log('[Scale-to-Zero] 15 minutes of inactivity reached. Shutting down...');
            const { exec } = require('child_process');
            exec('sudo shutdown -h now', (err, stdout, stderr) => {
                if (err) {
                    console.error('[Scale-to-Zero] Failed to execute shutdown:', err);
                }
            });
        }
    } else {
        zeroSessionsTime = 0;
    }
}, 60 * 1000);
