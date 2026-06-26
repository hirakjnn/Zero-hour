import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
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

    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required' });

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.VITE_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        let user;
        try {
            const result = await docClient.send(new GetCommand({
                TableName: USERS_TABLE,
                Key: { email }
            }));
            user = result.Item;
        } catch (dbErr) {
            console.error("DynamoDB Check Error:", dbErr.message);
            throw dbErr;
        }

        let userId;
        if (!user) {
            userId = 'usr_' + Math.random().toString(36).substring(2, 15);
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
        }

        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { email, userId, name: user?.name || name } });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(401).json({ error: 'Invalid Google credential or DB Error' });
    }
}
