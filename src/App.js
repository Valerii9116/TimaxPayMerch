import React, { useState } from 'react';
import Transak from '@transak/transak-sdk';
import WalletConnector from './components/WalletConnector';
import './App.css';

// --- IMPORTANT ---
// This is your public Transak Staging (Test) API Key.
const TRANSAK_API_KEY = "0fedc8c1-38db-455e-8792-8e8174bead31";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  
  // New state variables for multi-chain and multi-asset support
  const [fiatCurrency, setFiatCurrency] = useState('GBP');
  const [cryptoCurrency, setCryptoCurrency] = useState('USDC');
  const [network, setNetwork] = useState('polygon');

  const handleWalletConnect = (address, wrongNetwork) => {
    setWalletAddress(address);
    setIsWalletConnected(!!address);
    setIsWrongNetwork(wrongNetwork);
  };

  const launchTransak = (mode) => {
    setStatus(`Initializing ${mode === 'BUY' ? 'On-Ramp' : 'Off-Ramp'}...`);
    
    const transak = new Transak({
      apiKey: TRANSAK_API_KEY,
      environment: 'STAGING',
      productsAvailed: mode,
      
      // --- Dynamic Configuration ---
      fiatCurrency: fiatCurrency,
      cryptoCurrencyCode: cryptoCurrency, // Use state for crypto
      network: network,                   // Use state for network
      // --- End of Dynamic Configuration ---

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
          <p className="subtitle">Buy & Sell Crypto on your favorite network</p>
        </header>
        <main className="App-main">
          <div className="step-card">
            <WalletConnector onConnect={handleWalletConnect} />
          </div>

          {isWalletConnected && !isWrongNetwork && (
            <div className="step-card actions-container">
              
              <div className="selection-grid">
                {/* --- Crypto Currency Selector --- */}
                <div className="selector-group">
                  <h4>Select Crypto</h4>
                  <div className="radio-selector">
                    <label><input type="radio" value="USDC" checked={cryptoCurrency === 'USDC'} onChange={() => setCryptoCurrency('USDC')} /> USDC</label>
                    <label><input type="radio" value="USDT" checked={cryptoCurrency === 'USDT'} onChange={() => setCryptoCurrency('USDT')} /> USDT</label>
                  </div>
                </div>

                {/* --- Fiat Currency Selector --- */}
                <div className="selector-group">
                  <h4>Select Fiat</h4>
                  <div className="radio-selector">
                    <label><input type="radio" value="GBP" checked={fiatCurrency === 'GBP'} onChange={() => setFiatCurrency('GBP')} /> GBP</label>
                    <label><input type="radio" value="EUR" checked={fiatCurrency === 'EUR'} onChange={() => setFiatCurrency('EUR')} /> EUR</label>
                    <label><input type="radio" value="USD" checked={fiatCurrency === 'USD'} onChange={() => setFiatCurrency('USD')} /> USD</label>
                  </div>
                </div>
              </div>

              {/* --- Network Selector --- */}
              <div className="selector-group">
                <h4>Select Network</h4>
                <div className="radio-selector network-selector">
                  <label><input type="radio" value="polygon" checked={network === 'polygon'} onChange={() => setNetwork('polygon')} /> Polygon</label>
                  <label><input type="radio" value="solana" checked={network === 'solana'} onChange={() => setNetwork('solana')} /> Solana</label>
                  <label><input type="radio" value="linea" checked={network === 'linea'} onChange={() => setNetwork('linea')} /> Linea</label>
                  <label><input type="radio" value="arbitrum" checked={network === 'arbitrum'} onChange={() => setNetwork('arbitrum')} /> Arbitrum</label>
                  <label><input type="radio" value="ethereum" checked={network === 'ethereum'} onChange={() => setNetwork('ethereum')} /> Ethereum</label>
                </div>
              </div>

              <div className="button-container">
                <button onClick={() => launchTransak('BUY')} className="launch-button buy">Buy {cryptoCurrency} with {fiatCurrency}</button>
                <button onClick={() => launchTransak('SELL')} className="launch-button sell">Sell {cryptoCurrency} for {fiatCurrency}</button>
              </div>
            </div>
          )}
          
          {status && <p className="status-message main-status">{status}</p>}
        </main>
      </div>
    </div>
  );
}

export default App;
