module.exports = async function (context, req) {
    context.log('getConfig function processed a request.');
  
    const apiKey = process.env.TransakApiKey;
  
    if (apiKey && apiKey.length > 5) {
      context.log(`Successfully loaded TransakApiKey, starting with: ${apiKey.substring(0, 5)}`);
      context.res = {
        status: 200,
        body: { transakApiKey: apiKey },
        headers: { 'Content-Type': 'application/json' }
      };
    } else {
      context.log.error("CRITICAL ERROR: TransakApiKey is not set or is invalid in application settings.");
      context.res = {
        status: 500,
        body: { error: "Payment provider API key is not configured on the server." },
        headers: { 'Content-Type': 'application/json' }
      };
    }
  };