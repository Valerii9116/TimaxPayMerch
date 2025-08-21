const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");
const fetch = require('node-fetch');

async function getTransakAccessToken(apiKey, apiSecret, apiUrl) {
  const url = `${apiUrl}/partners/api/v2/refresh-token`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'api-secret': apiSecret, 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to refresh Transak token: ${response.statusText} - ${errorBody}`);
  }
  const data = await response.json();
  return data.data.accessToken;
}

module.exports = async function (context, req) {
  context.log('getCustomerByEmail function processed a request.');
  const { email } = req.body;
  if (!email) {
    context.res = { status: 400, body: JSON.stringify({ error: "Please provide an email." }), headers: { 'Content-Type': 'application/json' }};
    return;
  }

  try {
    const transakApiUrl = process.env.TRANSAK_API_URL || 'https://api.transak.com';
    const keyVaultUri = process.env.KEY_VAULT_URI;
    if (!keyVaultUri) throw new Error("KEY_VAULT_URI is not set.");

    const credential = new DefaultAzureCredential();
    const secretClient = new SecretClient(keyVaultUri, credential);

    const apiKeySecret = await secretClient.getSecret("TransakApiKey");
    const apiSecretSecret = await secretClient.getSecret("TransakApiSecret");
    const apiKey = apiKeySecret.value;
    const apiSecret = apiSecretSecret.value;

    const accessToken = await getTransakAccessToken(apiKey, apiSecret, transakApiUrl);
    const partnerCustomerId = encodeURIComponent(email);
    const ordersUrl = `${transakApiUrl}/partners/api/v2/orders?filter[partnerCustomerId]=${partnerCustomerId}`;

    const ordersResponse = await fetch(ordersUrl, {
      headers: { 'access-token': accessToken }
    });
    if (!ordersResponse.ok) {
      const errorBody = await ordersResponse.text();
      throw new Error(`Failed to fetch orders: ${ordersResponse.statusText} - ${errorBody}`);
    }

    const ordersData = await ordersResponse.json();
    const hasCompletedOrder = ordersData.data.some(order => order.status === 'COMPLETED');

    context.res = {
      status: 200,
      body: { kycStatus: hasCompletedOrder ? 'Completed' : 'Not Found' },
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    context.log.error("Error in getCustomerByEmail:", error.message);
    context.res = {
      status: 500,
      body: JSON.stringify({ error: `An error occurred: ${error.message}` }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};