module.exports = async function (context, req) {
  context.log('getConfig function processed a request.');

  const apiKey = process.env.TransakApiKey;

  if (apiKey) {
    context.res = {
      status: 200,
      body: { transakApiKey: apiKey },
      headers: { 'Content-Type': 'application/json' }
    };
  } else {
    context.log.error("TransakApiKey is not set in application settings.");
    context.res = {
      status: 500,
      body: { error: "Payment provider API key is not configured." },
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
