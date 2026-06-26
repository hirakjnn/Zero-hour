require('dotenv').config();
const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ 
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function run() {
    try {
        const data = await client.send(new CreateTableCommand({
            TableName: 'ZeroHourUsers',
            AttributeDefinitions: [
                { AttributeName: 'email', AttributeType: 'S' }
            ],
            KeySchema: [
                { AttributeName: 'email', KeyType: 'HASH' }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        }));
        console.log("Table Created Successfully!", data.TableDescription.TableName);
    } catch (err) {
        console.error("Error creating table:", err.message);
    }
}
run();
