import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const Login = ({ setUser }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      if (setUser) {
        setUser({
          username: credential.user.displayName || credential.user.email,
          email: credential.user.email,
          uid: credential.user.uid,
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      if (setUser) {
        setUser({
          username: credential.user.displayName || credential.user.email,
          email: credential.user.email,
          uid: credential.user.uid,
        });
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center">Login</h1>
      {error && <p className="text-danger">{error}</p>}
        <form onSubmit={handleSubmit}>
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
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
      <div className="mt-3">
        <button type="button" className="btn btn-outline-secondary" onClick={handleGoogleLogin}>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
