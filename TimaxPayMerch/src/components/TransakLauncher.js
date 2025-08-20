import React from 'react';
import Transak from '@transak/transak-sdk';

function TransakLauncher({ apiKey, walletAddress, mode, setStatus, email }) {
  const launch = () => {
    if (!apiKey || !walletAddress) {
      setStatus('Configuration missing or wallet not connected.');
      return;
    }
    // Use the email from the KYC checker as the primary identifier if available
    if (!email) {
      setStatus('Please enter an email in the KYC checker first.');
      return;
    }

    setStatus(`Initializing ${mode === 'BUY' ? 'On-Ramp' : 'Off-Ramp'}...`);
    
    const transak = new Transak({
      apiKey: apiKey,
      environment: 'PRODUCTION', // Or 'STAGING'
      productsAvailed: mode,
      fiatCurrency: 'GBP',
      cryptoCurrencyCode: 'USDC',
      network: 'polygon',
      walletAddress: walletAddress,
      // Pass the email to Transak for consistent user tracking
      email: email, 
      partnerCustomerId: email, 
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
    <button onClick={launch} className={`launch-button ${mode.toLowerCase()}`}>
      {mode === 'BUY' ? 'Buy USDC' : 'Sell USDC'}
    </button>
  );
}
export default TransakLauncher;
