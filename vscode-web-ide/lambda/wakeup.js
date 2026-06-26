const { EC2Client, StartInstancesCommand, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");

const ec2 = new EC2Client({ region: process.env.AWS_REGION || "us-east-1" });
const INSTANCE_ID = process.env.INSTANCE_ID;

exports.handler = async (event) => {
    // Handle CORS preflight for API Gateway
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    if (!INSTANCE_ID) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "INSTANCE_ID not set in Lambda Environment Variables" }) };
    }

    try {
        // 1. Check current status
        const describeCmd = new DescribeInstancesCommand({ InstanceIds: [INSTANCE_ID] });
        const data = await ec2.send(describeCmd);
        const state = data.Reservations[0].Instances[0].State.Name;

        if (state === "stopped") {
            // 2. Start the instance if stopped
            console.log("Instance stopped. Sending start command...");
            const startCmd = new StartInstancesCommand({ InstanceIds: [INSTANCE_ID] });
            await ec2.send(startCmd);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: "booting", message: "EC2 Instance is powering on." })
            };
        } else if (state === "running") {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: "running", message: "EC2 Instance is already running." })
            };
        } else {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: state, message: `EC2 Instance is in state: ${state}` })
            };
        }
    } catch (err) {
        console.error("Error interacting with EC2:", err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
};
