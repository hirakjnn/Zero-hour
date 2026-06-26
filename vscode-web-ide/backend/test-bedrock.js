const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

async function test() {
  try {
    const res = await bedrock.send(new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 10,
        messages: [{ role: "user", content: "hi" }]
      })
    }));
    console.log('Bedrock Success!');
  } catch (e) {
    console.log('Bedrock Error:', e.name, e.message);
  }
}
test();
