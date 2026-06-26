import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const client = new DynamoDBClient({ 
        region: process.env.VITE_AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
    const docClient = DynamoDBDocumentClient.from(client);
    const USERS_TABLE = 'ZeroHourUsers';
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_zero_hour';

    try {
        const check = await docClient.send(new GetCommand({
            TableName: USERS_TABLE,
            Key: { email }
        }));
        if (check.Item) {
            return res.status(400).json({ error: 'User already exists' });
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
        res.status(200).json({ token, user: { email, userId, name: email.split('@')[0] } });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: 'Failed to register user' });
    }
}
