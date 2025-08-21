import React, { useState } from ‘react’;
import Transak from ‘@transak/transak-sdk’;
import WalletConnector from ‘./components/WalletConnector’;
import ‘./App.css’;

// — IMPORTANT —
// This is your public Transak API Key.
const TRANSAK_API_KEY = “2976d312-19d8-4dd2-b7b4-ff29cdcaa745”;

function App() {
const [walletAddress, setWalletAddress] = useState(null);
const [status, setStatus] = useState(’’);
const [isWalletConnected, setIsWalletConnected] = useState(false);
const [isWrongNetwork, setIsWrongNetwork] = useState(false);
const [fiatCurrency, setFiatCurrency] = useState(‘GBP’);

const handleWalletConnect = (address, wrongNetwork) => {
setWalletAddress(address);
setIsWalletConnected(!!address);
setIsWrongNetwork(wrongNetwork);
};

const launchTransak = (mode) => {
if (!TRANSAK_API_KEY || TRANSAK_API_KEY === “YOUR_PUBLIC_TRANSAK_API_KEY”) {
setStatus(“Error: Please add your Transak API Key to App.js”);
return;
}

```
setStatus(`Initializing ${mode === 'BUY' ? 'On-Ramp' : 'Off-Ramp'}...`);

try {
  // Simplified configuration to avoid T-INF-103 error
  const transakConfig = {
    apiKey: TRANSAK_API_KEY,
    environment: 'PRODUCTION', // Try 'STAGING' if this doesn't work
    productsAvailed: mode,
    fiatCurrency: fiatCurrency,
    defaultCryptoCurrency: 'USDT',
    network: 'polygon',
    walletAddress: walletAddress,
    disableWalletAddressForm: true,
    hideMenu: true,
    widgetHeight: '650px',
    widgetWidth: '100%',
    // Removed potentially problematic parameters:
    // - partnerCustomerId (can cause issues)
    // - isFeeCalculationHidden
    // - hideExchangeScreen
    // - exchangeScreenTitle
    // - defaultFiatAmount
  };

  console.log('Transak Config:', transakConfig); // Debug log

  const transak = new Transak(transakConfig);

  // Add error handling
  transak.on('TRANSAK_WIDGET_INITIALISED', () => {
    console.log('Widget initialized successfully');
    setStatus(`${mode === 'BUY' ? 'On-Ramp' : 'Off-Ramp'} widget loaded`);
  });

  transak.on('TRANSAK_WIDGET_OPEN', () => {
    console.log('Widget opened');
  });

  transak.on('TRANSAK_WIDGET_CLOSE', () => {
    setStatus('Widget closed.');
    console.log('Widget closed');
  });

  transak.on('TRANSAK_ORDER_CREATED', (orderData) => {
    setStatus(`Order created. Processing...`);
    console.log('Order created:', orderData);
  });

  transak.on('TRANSAK_ORDER_SUCCESSFUL', (orderData) => {
    setStatus(`Success! Your ${mode} order is complete.`);
    console.log('Order successful:', orderData);
    setTimeout(() => transak.close(), 5000);
  });

  transak.on('TRANSAK_ORDER_FAILED', (error) => {
    setStatus('Transaction failed. Please try again.');
    console.error('Order failed:', error);
  });

  // Add general error handler
  transak.on('TRANSAK_ORDER_CANCELLED', () => {
    setStatus('Transaction cancelled.');
    console.log('Order cancelled');
  });

  transak.init();

} catch (error) {
  console.error('Transak initialization error:', error);
  setStatus(`Error: ${error.message || 'Failed to initialize Transak'}`);
}
```

};

return (
<div className="App">
<div className="app-container">
<header className="App-header">
<h1>TimaxPay Merch Gateway</h1>
<p className="subtitle">Buy & Sell Crypto on Polygon</p>
</header>
<main className="App-main">
<div className="step-card">
<WalletConnector onConnect={handleWalletConnect} />
</div>

```
      {isWalletConnected && !isWrongNetwork && (
        <div className="step-card actions-container">
          <div className="currency-selector">
            <label><input type="radio" value="GBP" checked={fiatCurrency === 'GBP'} onChange={() => setFiatCurrency('GBP')} /> GBP</label>
            <label><input type="radio" value="EUR" checked={fiatCurrency === 'EUR'} onChange={() => setFiatCurrency('EUR')} /> EUR</label>
            <label><input type="radio" value="USD" checked={fiatCurrency === 'USD'} onChange={() => setFiatCurrency('USD')} /> USD</label>
          </div>
          <button onClick={() => launchTransak('BUY')} className="launch-button buy">Buy USDT with {fiatCurrency}</button>
          <button onClick={() => launchTransak('SELL')} className="launch-button sell">Sell USDT for {fiatCurrency}</button>
        </div>
      )}
      
      {status && <p className="status-message main-status">{status}</p>}
    </main>
  </div>
</div>
```

);
}

export default App;