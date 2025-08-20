import React, { useState } from 'react';

// This component is now controlled by App.js
function KycChecker({ email, onEmailChange }) {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusType, setStatusType] = useState('info'); // 'info', 'success', 'error'

  const handleCheckKyc = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus('Please enter an email address.');
      setStatusType('error');
      return;
    }
    setIsLoading(true);
    setStatus('Checking status...');
    setStatusType('info');

    try {
      const response = await fetch('/api/getCustomerByEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || `HTTP error! Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (result.kycStatus === 'Completed') {
        setStatus(`A previous transaction was completed with this email. KYC is likely verified.`);
        setStatusType('success');
      } else {
        setStatus('No completed transaction found for this email. You can complete verification by starting a new transaction.');
        setStatusType('info');
      }

    } catch (error) {
      console.error('KYC Check Error:', error);
      setStatus(`Error: ${error.message}`);
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kyc-checker">
      <h3>Check Transaction History</h3>
      <p>Enter an email to check if it has been used in a completed transaction before.</p>
      <form onSubmit={handleCheckKyc}>
        <input
          type="email"
          value={email} // Use the email from props
          onChange={(e) => onEmailChange(e.target.value)} // Call the handler from props
          placeholder="Enter your email"
          className="kyc-input"
          disabled={isLoading}
        />
        <button type="submit" className="kyc-button" disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Check History'}
        </button>
      </form>
      {status && <p className={`status-message ${statusType}`}>{status}</p>}
    </div>
  );
}
export default KycChecker;
