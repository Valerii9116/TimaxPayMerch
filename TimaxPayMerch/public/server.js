// server.js
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? `https://timax-pay-v2-app.azurewebsites.net` // Replace with your app's URL
    : 'http://localhost:3000', // Default React dev port
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// --- Serve React App ---
// Serve the static files from the React app's build directory
app.use(express.static(path.join(__dirname, 'build')));

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
// For any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
