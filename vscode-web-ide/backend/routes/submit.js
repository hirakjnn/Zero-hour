const express = require('express');
const router = express.Router();
const sessionManager = require('../services/SessionManager');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' }); // Default or fallback region
const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const SYSTEM_PROMPT = `You are a strict, expert AI code evaluator.
You are evaluating a candidate's submitted code for a technical interview challenge.
You will be provided with the 'git diff' of their changes.

You must evaluate their changes and return ONLY a valid JSON object matching this exact schema, with no markdown formatting or extra text:
{
  "score": <number between 0 and 100>,
  "feedback": "<A concise, 2-3 sentence feedback on their approach. What did they do right? What did they miss?>",
  "fixed": <boolean, true if they successfully solved the core bug/feature, false otherwise>
}`;

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
            diffOutput = stdout || "No changes made.";
        } catch (err) {
            console.error('Failed to get git diff:', err);
            diffOutput = 'Error retrieving diff or no git repository found.';
        }

        // Call AWS Bedrock Llama 3 LLM
        let scorecard = {
            score: 0,
            feedback: "Evaluation failed to run.",
            fixed: false
        };

        try {
            const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${SYSTEM_PROMPT}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nHere is the candidate's git diff:\n\n\`\`\`diff\n${diffOutput}\n\`\`\`\n\nEvaluate this diff and return ONLY the JSON object.<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n{`;
            
            const command = new InvokeModelCommand({
                modelId: 'meta.llama3-70b-instruct-v1:0', // Llama 3 70B Instruct
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify({
                    prompt: prompt,
                    max_gen_len: 512,
                    temperature: 0.1,
                    top_p: 0.9
                })
            });

            const response = await bedrock.send(command);
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            let generation = responseBody.generation;

            // Clean up the output to ensure it's valid JSON
            // We started the prompt with `{`, so we might need to prepend it if Llama didn't include it.
            if (!generation.trim().startsWith('{')) {
                generation = '{' + generation;
            }
            
            // Strip any trailing text after the closing brace
            const lastBraceIndex = generation.lastIndexOf('}');
            if (lastBraceIndex !== -1) {
                generation = generation.substring(0, lastBraceIndex + 1);
            }

            scorecard = JSON.parse(generation);
        } catch (llmErr) {
            console.error('[Submit] Bedrock evaluation failed:', llmErr);
            scorecard.feedback = "AWS Bedrock evaluation failed. Returning default scorecard.";
        }

        // Add diff length for stats
        scorecard.details = { diffLength: diffOutput.length };

        // Save to Local JSON Database (Bypassing DynamoDB to avoid IAM permission issues)
        try {
            const fs = require('fs');
            const path = require('path');
            const dbPath = path.join(__dirname, '../evaluations_db.json');
            
            let db = {};
            if (fs.existsSync(dbPath)) {
                db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }
            
            db[sessionId] = {
                sessionId: sessionId,
                score: scorecard.score,
                feedback: scorecard.feedback,
                fixed: scorecard.fixed,
                diffLength: scorecard.details.diffLength,
                createdAt: new Date().toISOString()
            };
            
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            console.log('[DB Sync] Saved scorecard to local evaluations_db.json.');
        } catch (dbErr) {
            console.error('[DB Sync] Failed to save to local database.', dbErr);
        }

        // Destroy the Docker session completely
        try {
            await sessionManager.destroySession(sessionId);
        } catch(err) {
            console.error('[Submit] Failed to destroy session:', err);
        }

        res.json({ success: true, scorecard });
    } catch (e) {
        console.error('Submit error:', e);
        res.status(500).json({ error: 'Failed to process submission' });
    }
});

module.exports = router;
