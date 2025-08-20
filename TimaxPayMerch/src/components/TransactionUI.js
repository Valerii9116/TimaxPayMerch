import React, { useState } from 'react';
import Transak from '@transak/transak-sdk';

function TransactionUI({ apiKey, walletAddress, setStatus }) {
  const [fiatCurrency, setFiatCurrency] = useState('GBP');

  const launchTransak = (mode) => {
    setStatus(`Initializing ${mode === 'BUY' ? 'On-Ramp' : 'Off-Ramp'}...`);
    
    const transak = new Transak({
      apiKey: apiKey,
      environment: 'PRODUCTION', // Or 'STAGING'
      productsAvailed: mode,
      fiatCurrency: fiatCurrency,
      cryptoCurrencyCode: 'USDC',
      network: 'polygon',
      walletAddress: walletAddress,
      // Use the wallet address as the unique customer identifier
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
    <div className="step-card actions-container">
      <div className="currency-selector">
        <label>
          <input type="radio" value="GBP" checked={fiatCurrency === 'GBP'} onChange={() => setFiatCurrency('GBP')} />
          GBP
        </label>
        <label>
          <input type="radio" value="EUR" checked={fiatCurrency === 'EUR'} onChange={() => setFiatCurrency('EUR')} />
          EUR
        </label>
        <label>
          <input type="radio" value="USD" checked={fiatCurrency === 'USD'} onChange={() => setFiatCurrency('USD')} />
          USD
        </label>
      </div>
      <button onClick={() => launchTransak('BUY')} className="launch-button buy">
        Buy USDC with {fiatCurrency}
      </button>
      <button onClick={() => launchTransak('SELL')} className="launch-button sell">
        Sell USDC for {fiatCurrency}
      </button>
    </div>
  );
}

export default TransactionUI;
