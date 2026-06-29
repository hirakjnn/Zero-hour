const express = require('express');
const router = express.Router();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// GET /api/evaluations/:sessionId
router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(__dirname, '../evaluations_db.json');
        
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        }
        
        const item = db[sessionId];

        if (!item) {
            return res.status(404).json({ error: 'Evaluation not found' });
        }

        res.json({ success: true, evaluation: item });
    } catch (e) {
        console.error('Failed to fetch evaluation:', e);
        res.status(500).json({ error: 'Failed to fetch evaluation' });
    }
});

module.exports = router;
