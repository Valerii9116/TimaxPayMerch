import React, { useState, useEffect } from 'react';
import WalletConnector from './components/WalletConnector';
import TransactionUI from './components/TransactionUI'; // We will keep this component for clarity
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [transakApiKey, setTransakApiKey] = useState(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/getConfig');
        if (!response.ok) throw new Error('Failed to fetch config');
        const config = await response.json();
        setTransakApiKey(config.transakApiKey);
      } catch (error) {
        console.error("Config fetch error:", error);
        setStatus('Error: Could not load payment provider.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
  };

  return (
    <div className="App">
      <div className="app-container">
        <header className="App-header">
          <h1>TimaxPay V2 Gateway</h1>
          <p className="subtitle">Buy & Sell USDC on Polygon</p>
        </header>

        <main className="App-main">
          <div className="step-card">
            <WalletConnector onConnect={handleWalletConnect} />
          </div>

          {isLoading && <p className="status-message">Loading payment provider...</p>}

          {walletAddress && transakApiKey && (
            <TransactionUI 
              apiKey={transakApiKey} 
              walletAddress={walletAddress} 
              setStatus={setStatus} 
            />
          )}
          
          {status && <p className="status-message main-status">{status}</p>}
        </main>
      </div>
    </div>
  );
}
export default App;
