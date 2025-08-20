const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

module.exports = async function (context, req) {
  context.log('getConfig function processed a request.');
  try {
    const keyVaultUri = process.env.KEY_VAULT_URI;
    if (!keyVaultUri) throw new Error("KEY_VAULT_URI is not set.");
    const credential = new DefaultAzureCredential();
    const secretClient = new SecretClient(keyVaultUri, credential);
    const apiKeySecret = await secretClient.getSecret("TransakApiKey");
    context.res = {
      status: 200,
      body: { transakApiKey: apiKeySecret.value },
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    context.log.error("Error in getConfig:", error);
    context.res = { status: 500, body: "Failed to retrieve configuration." };
  }
};
