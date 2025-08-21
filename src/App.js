import React, { useState } from 'react';
import WalletConnector from './components/WalletConnector';
import TransactionUI from './components/TransactionUI';
import './App.css';

// --- IMPORTANT ---
// Paste your PUBLIC Transak Production API Key here
const TRANSAK_API_KEY = "2976d312-19d8-4dd2-b7b4-ff29cdcaa745";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState('');

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

          {walletAddress && (
            <TransactionUI 
              apiKey={TRANSAK_API_KEY} 
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