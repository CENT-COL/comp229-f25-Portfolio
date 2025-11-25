import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ setUser }) => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [qrCode, setQrCode] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // Step 1: Registration, Step 2: OTP Setup

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        setForm({ ...form, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            })

            if (!response.ok) {
                throw new Error('Failed to register');
            }

            const data = await response.json();

            // proceed to 2FA setup

            const success = await setup2FA(form.email);
            if (success) {
                setError('');
                setStep(2);
            }

            // localStorage.setItem('token', data.token);
            // localStorage.setItem('username', data.user.username);
            // if (setUser) {
            //     setUser({ username: data.user.username });
            // }
            // navigate('/');

        } catch (error) {
            setError(error.message);
        }
    }

    const setup2FA = async (email) => {
        const response = await fetch(`/api/users/setup-2fa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            const data = await response.json();
            setQrCode(data.imageUrl);
            return true;
        } else {
            setError('Failed to generate QR code');
            return false;
        }
    }

    const verify2FASetup = async () => {
        const response = await fetch(`/api/users/verify-2fa-setup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: form.email, token: otp }),
        });

        if (response.ok) {
            setError('2FA setup is complete. You can now log in.');
            navigate('/login');
        } else {
            setError('Invalid OTP');
        }
    };

    return (
    <div className="container mt-4">
      <h1 className="text-center">Register</h1>
      {error && <p className="text-danger">{error}</p>}
      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Register</button>
        </form>
      )}
      {step === 2 && (
        <div>
          {qrCode && <img src={qrCode} alt="QR Code" />}
          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              className="form-control"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button onClick={verify2FASetup} className="btn btn-primary">Verify OTP</button>
        </div>
      )}
    </div>
  );
}

export default Register;