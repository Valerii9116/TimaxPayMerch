// src/server.js
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 8080;

// --- Security Middleware ---

// Set various security HTTP headers
app.use(helmet());

// Configure CORS to only allow requests from your frontend's origin
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? `https://timax-pay-v2-app.azurewebsites.net` // Replace with your app's URL
    : 'http://localhost:8080',
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// --- Static File Serving ---
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API Routes ---
app.get('/api/config', (req, res) => {
  if (!process.env.TRANSAK_API_KEY) {
    return res.status(500).json({ error: 'Server configuration is incomplete.' });
  }
  res.json({
    transakApiKey: process.env.TRANSAK_API_KEY,
  });
});

// --- Frontend Catch-all Route ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
