const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/evaluations/:sessionId
router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const dbPath = path.join(__dirname, '../evaluations_db.json');
        
        let db = {};
        if (fs.existsSync(dbPath)) {
            try {
                const fileContent = fs.readFileSync(dbPath, 'utf8');
                if (fileContent && fileContent.trim() !== "") {
                    db = JSON.parse(fileContent);
                }
            } catch (parseErr) {
                console.error('Failed to parse evaluations_db.json:', parseErr);
                // If it fails to parse, we'll just treat it as empty
                db = {};
            }
        }
        
        const item = db[sessionId];

        if (!item) {
            return res.status(404).json({ error: 'Evaluation not found for this session ID' });
        }

        res.json({ success: true, evaluation: item });
    } catch (e) {
        console.error('Failed to fetch evaluation:', e);
        res.status(500).json({ error: 'Server error: ' + e.message });
    }
});

module.exports = router;
