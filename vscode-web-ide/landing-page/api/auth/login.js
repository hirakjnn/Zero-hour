import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
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
        const result = await docClient.send(new GetCommand({
            TableName: USERS_TABLE,
            Key: { email }
        }));

        const user = result.Item;
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { email: user.email, userId: user.userId, name: user.name } });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: 'Failed to login' });
    }
}
