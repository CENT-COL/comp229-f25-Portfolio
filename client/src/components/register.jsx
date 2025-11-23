import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const Register = ({ setUser }) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      if (form.username) {
        await updateProfile(credential.user, { displayName: form.username });
      }

      if (setUser) {
        setUser({
          username: form.username || credential.user.email,
          email: credential.user.email,
        uid: credential.user.uid,
      });
    }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to register');
    }
  };

  const handleGoogleSignup = async () => {
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

  return (
    <div className="container mt-4">
      <h1 className="text-center">Register</h1>
      {error && <p className="text-danger">{error}</p>}
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
          <button type="submit" className="btn btn-primary">
            Register
          </button>
        </form>
        <div className="mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleGoogleSignup}
          >
            Continue with Google
          </button>
        </div>
    </div>
  );
};

export default Register;
