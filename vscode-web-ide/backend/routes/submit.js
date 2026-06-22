const express = require('express');
const router = express.Router();
const sessionManager = require('../services/SessionManager');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

router.post('/', async (req, res) => {
    try {
        const sessionId = req.body.sessionId || req.headers['x-session-id'] || req.sessionId;
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const session = sessionManager.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const containerName = session.containerName;
        if (!containerName) {
            return res.status(400).json({ error: 'Session container not found' });
        }

        // Run docker exec to grab git diff
        let diffOutput = '';
        try {
            const { stdout } = await execPromise(`docker exec ${containerName} git diff`);
            diffOutput = stdout;
        } catch (err) {
            console.error('Failed to get git diff:', err);
            diffOutput = 'Error retrieving diff or no git repository found.';
        }

        // Run docker exec to grab .opencode/sessions log file
        let sessionLogs = '';
        try {
            const { stdout } = await execPromise(`docker exec ${containerName} cat /home/developer/workspace/.opencode/sessions`);
            sessionLogs = stdout;
        } catch (err) {
            console.error('Failed to get session logs:', err);
            sessionLogs = 'Error retrieving session logs or file not found.';
        }

        // TODO: Call AWS Bedrock LLM with diffOutput and sessionLogs
        // Mock response for now
        const mockScorecard = {
            score: 95,
            feedback: "Great job! You found the bug and fixed it correctly.",
            details: {
                diffLength: diffOutput.length,
                logsRead: sessionLogs.length > 0
            }
        };

        res.json({ success: true, scorecard: mockScorecard });
    } catch (e) {
        console.error('Submit error:', e);
        res.status(500).json({ error: 'Failed to process submission' });
    }
});

module.exports = router;
