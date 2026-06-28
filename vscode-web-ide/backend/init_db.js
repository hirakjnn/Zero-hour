const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const ddbClient = new DynamoDBClient({ region: 'us-east-1' });

async function initDB() {
    const tableName = 'ZeroHour_Evaluations';
    
    try {
        await ddbClient.send(new DescribeTableCommand({ TableName: tableName }));
        console.log(`[DB Init] Table ${tableName} already exists.`);
    } catch (err) {
        if (err.name === 'ResourceNotFoundException') {
            console.log(`[DB Init] Table ${tableName} not found. Creating it now...`);
            try {
                await ddbClient.send(new CreateTableCommand({
                    TableName: tableName,
                    KeySchema: [
                        { AttributeName: 'sessionId', KeyType: 'HASH' }
                    ],
                    AttributeDefinitions: [
                        { AttributeName: 'sessionId', AttributeType: 'S' }
                    ],
                    BillingMode: 'PAY_PER_REQUEST'
                }));
                console.log(`[DB Init] Successfully created table ${tableName}.`);
            } catch (createErr) {
                console.error(`[DB Init] Failed to create table ${tableName}:`, createErr);
            }
        } else {
            console.error(`[DB Init] Error checking for table ${tableName}:`, err);
        }
    }
}

module.exports = initDB;
