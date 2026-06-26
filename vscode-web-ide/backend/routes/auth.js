const express = require('express');
const router = express.Router();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Setup DynamoDB
// Use local region and fallback mock if credentials are missing
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = 'ZeroHourUsers';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_zero_hour';

// 1. Register User
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        // Check if user exists
        try {
            const check = await docClient.send(new GetCommand({
                TableName: USERS_TABLE,
                Key: { email }
            }));
            if (check.Item) {
                return res.status(400).json({ error: 'User already exists' });
            }
        } catch (dbErr) {
            console.error("DynamoDB Check Error:", dbErr.message);
            // We ignore ResourceNotFoundException for local testing when the table doesn't exist yet, 
            // but in production it should be created via IaC (e.g. Terraform).
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = 'usr_' + Math.random().toString(36).substring(2, 15);

        await docClient.send(new PutCommand({
            TableName: USERS_TABLE,
            Item: {
                email,
                userId,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            }
        }));

        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { email, userId } });

    } catch (err) {
        console.error("Registration Error:", err);
        // Fallback for local testing if AWS credentials are not configured
        if (err.name === 'CredentialsProviderError' || err.name === 'ResourceNotFoundException') {
            console.log('[MOCK AUTH] Falling back to mock registration because AWS credentials/table are missing.');
            const token = jwt.sign({ userId: 'mock_123', email }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: { email, userId: 'mock_123' }, mock: true });
        }
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// 2. Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const result = await docClient.send(new GetCommand({
            TableName: USERS_TABLE,
            Key: { email }
        }));

        const user = result.Item;
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { email: user.email, userId: user.userId } });

    } catch (err) {
        console.error("Login Error:", err);
        if (err.name === 'CredentialsProviderError' || err.name === 'ResourceNotFoundException') {
            console.log('[MOCK AUTH] Falling back to mock login because AWS credentials/table are missing.');
            const token = jwt.sign({ userId: 'mock_123', email }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: { email, userId: 'mock_123' }, mock: true });
        }
        res.status(500).json({ error: 'Failed to login' });
    }
});

// 3. Google OAuth Login/Register
router.post('/google', async (req, res) => {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required' });

    try {
        // Verify the token using Google's official library
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        // Check if user exists in DynamoDB
        let user;
        try {
            const result = await docClient.send(new GetCommand({
                TableName: USERS_TABLE,
                Key: { email }
            }));
            user = result.Item;
        } catch (dbErr) {
            console.error("DynamoDB Check Error:", dbErr.message);
            // Handle mock fallback
            if (dbErr.name === 'CredentialsProviderError' || dbErr.name === 'ResourceNotFoundException') {
                console.log('[MOCK AUTH] Falling back to mock Google login because AWS credentials/table are missing.');
                const token = jwt.sign({ userId: googleId, email }, JWT_SECRET, { expiresIn: '7d' });
                return res.json({ token, user: { email, userId: googleId, name }, mock: true });
            }
            throw dbErr;
        }

        let userId;
        if (!user) {
            // User doesn't exist, create a new record for this Google user
            userId = 'usr_' + Math.random().toString(36).substring(2, 15);
            // We use a dummy random password since they use Google to auth
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
            
            await docClient.send(new PutCommand({
                TableName: USERS_TABLE,
                Item: {
                    email,
                    userId,
                    name,
                    googleId,
                    password: dummyPassword,
                    createdAt: new Date().toISOString()
                }
            }));
        } else {
            userId = user.userId;
            // Optionally, we could update the user's name if they didn't have one
        }

        // Issue our own JWT
        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { email, userId, name: user?.name || name } });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(401).json({ error: 'Invalid Google credential' });
    }
});

module.exports = router;
