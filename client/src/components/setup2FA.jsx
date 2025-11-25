import { useState } from 'react';

const Setup2FA = ({ email }) => {
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const setup2FA = async () => {
    const response = await fetch(`/api/users/setup-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const data = await response.json();
      setQrCode(data.imageUrl);
    } else {
      console.log('Failed to generate QR code');
    }
  };

  const verify2FASetup = async () => {
    const response = await fetch(`/api/users/verify-2fa-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, token: otp }),
    });

    if (response.ok) {
      setMessage('2FA setup is valid');
    } else {
      setMessage('Invalid OTP');
    }
  };

  return (
    <div>
      <h1>Setup 2FA</h1>
      <button onClick={setup2FA}>Generate QR Code</button>
      {qrCode && <img src={qrCode} alt="QR Code" />}
      {qrCode && (
        <div>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verify2FASetup}>Verify OTP</button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Setup2FA;