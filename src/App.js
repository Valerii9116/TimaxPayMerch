import React, { useState } from 'react';
import Transak from '@transak/transak-sdk';
import WalletConnector from './components/WalletConnector';
import './App.css';

// --- IMPORTANT ---
// This is your public Transak Production API Key.
const TRANSAK_API_KEY = "0fedc8c1-38db-455e-8792-8e8174bead31";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [fiatCurrency, setFiatCurrency] = useState('GBP');

  const handleWalletConnect = (address, wrongNetwork) => {
    setWalletAddress(address);
    setIsWalletConnected(!!address);
    setIsWrongNetwork(wrongNetwork);
  };

  const launchTransak = (mode) => {
    if (!TRANSAK_API_KEY || TRANSAK_API_KEY === "YOUR_PUBLIC_TRANSAK_API_KEY") {
        setStatus("Error: Please add your Transak API Key to App.js");
        return;
    }

    setStatus(`Initializing ${mode === 'BUY' ? 'On-Ramp' : 'Off-Ramp'}...`);
    
    const transak = new Transak({
      apiKey: TRANSAK_API_KEY,
      // **CORRECTION**: Set to PRODUCTION to match your live API key.
      environment: 'STAGING',
      productsAvailed: mode,
      fiatCurrency: fiatCurrency,
      defaultCryptoCurrency: 'USDT',
      network: 'polygon',
      walletAddress: walletAddress,
      partnerCustomerId: walletAddress, 
      disableWalletAddressForm: true,
      hideMenu: true,
      widgetHeight: '650px',
      widgetWidth: '100%',
    });

    transak.init();

    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => setStatus('Widget closed.'));
    transak.on(transak.EVENTS.TRANSAK_ORDER_CREATED, () => setStatus(`Order created. Processing...`));
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, () => {
      setStatus(`Success! Your ${mode} order is complete.`);
      setTimeout(() => transak.close(), 5000);
    });
    transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, () => setStatus('Transaction failed. Please try again.'));
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
  );
}

export default App;
