import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// --- Configuration ---
const USDC_CONTRACT_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// Polygon Mainnet details
const POLYGON_CHAIN_ID = '0x89'; // 137
const POLYGON_NETWORK_PARAMS = {
  chainId: POLYGON_CHAIN_ID,
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/'],
};

function WalletConnector({ onConnect }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false); // New state for network check

  // --- Function to fetch the USDC balance ---
  const getBalance = async (address, provider) => {
    if (!address || !provider) return;
    try {
      setUsdcBalance('Fetching...');
      const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, provider);
      const balanceRaw = await usdcContract.balanceOf(address);
      const decimals = await usdcContract.decimals();
      const balanceFormatted = ethers.formatUnits(balanceRaw, decimals);
      setUsdcBalance(parseFloat(balanceFormatted).toFixed(2));
    } catch (error) {
      console.error("Error fetching USDC balance:", error);
      setUsdcBalance('Error');
    }
  };

  // --- Function to check network and handle connection ---
  // useCallback memoizes the function so it doesn't get recreated on every render,
  // preventing an infinite loop in the useEffect hook.
  const connectAndCheckNetwork = useCallback(async () => {
    if (!window.ethereum) {
      setErrorMessage("Please install a Web3 wallet like MetaMask.");
      return;
    }

    try {
      setErrorMessage(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== parseInt(POLYGON_CHAIN_ID).toString()) {
        setIsWrongNetwork(true);
        setErrorMessage('Wrong Network: Please switch to Polygon Mainnet.');
        return; 
      }
      
      setIsWrongNetwork(false);

      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        onConnect(address);
        getBalance(address, provider);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setErrorMessage("Failed to connect wallet.");
    }
  }, [onConnect]);

  // --- Function to switch network ---
  const switchNetworkHandler = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }],
      });
      // After switching, reconnect to verify and get balance
      connectAndCheckNetwork();
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_NETWORK_PARAMS],
          });
          // After adding, reconnect
          connectAndCheckNetwork();
        } catch (addError) {
          setErrorMessage("Failed to add Polygon network to wallet.");
        }
      } else {
        setErrorMessage("Failed to switch network. Please do it manually in your wallet.");
      }
    }
  };

  // --- Effect to handle account and network changes ---
  useEffect(() => {
    const handleChainChanged = () => {
      window.location.reload();
    };

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        connectAndCheckNetwork(); // Re-run the full check on account change
      } else {
        setWalletAddress(null);
        setUsdcBalance(null);
        setIsWrongNetwork(false);
        onConnect(null);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [onConnect, connectAndCheckNetwork]); // Dependency added

  return (
    <div className="wallet-connector">
      {walletAddress && !isWrongNetwork ? (
        <div className="wallet-info">
          <div>
            <p className="wallet-address-label">Connected Wallet:</p>
            <p className="wallet-address">
              <strong>{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</strong>
            </p>
          </div>
          <div className="balance-display">
            <p className="balance-label">USDC Balance</p>
            <p className="balance-value">{usdcBalance !== null ? usdcBalance : 'N/A'}</p>
          </div>
        </div>
      ) : (
        <div className="connection-controls">
          <button onClick={connectAndCheckNetwork} className="connect-button">
            Connect Wallet
          </button>
          {isWrongNetwork && (
            <button onClick={switchNetworkHandler} className="switch-network-button">
              Switch to Polygon
            </button>
          )}
        </div>
      )}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}
export default WalletConnector;
