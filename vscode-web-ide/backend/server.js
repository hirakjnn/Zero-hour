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
        const match = req.url.match(/^\/preview\/([a-zA-Z0-9]+)/);
        if (match) {
            const session = sessionManager.getSession(match[1]);
            if (session) return `http://127.0.0.1:${session.port}`;
        }
        return 'http://127.0.0.1:32000'; // Fallback to dead port if invalid
    },
    changeOrigin: true,
    ws: true,
    xfwd: true, // Crucial for code-server to understand proxy protocol/host
    logLevel: 'error'
});

// HTTP middleware to catch invalid sessions gracefully
app.use('/preview/:sessionId', (req, res, next) => {
    const session = sessionManager.getSession(req.params.sessionId);
    if (!session) return res.status(404).send('Session expired or not found.');
    next();
});

// Apply proxy for HTTP traffic
app.use('/preview', previewProxy);

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
    if (req.url.startsWith('/preview')) {
        // Forward WebSocket to the global proxy instance
        previewProxy.upgrade(req, socket, head);
    } else {
        socket.destroy();
    }
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
