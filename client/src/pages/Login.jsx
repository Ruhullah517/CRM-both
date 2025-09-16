import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Check for invalid credentials (401) or other errors
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('Failed to log in. Please try again.');
      }
      console.error('Failed to log in:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">BFCA CRM Login</h1>
        {!showForgot && (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="mt-3 text-center">
            <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => { setShowForgot(true); setError(''); }}>
              Forgot password?
            </button>
          </div>
        </form>
        )}
        {showForgot && (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
            />
            <button
              type="button"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              onClick={async () => {
                setForgotStatus('');
                try {
                  await requestPasswordReset(forgotEmail);
                  setForgotStatus('If the email exists, a reset link has been sent.');
                } catch (e) {
                  setForgotStatus('If the email exists, a reset link has been sent.');
                }
              }}
            >
              Send reset link
            </button>
            <div className="text-center">
              <button type="button" className="text-sm text-gray-600 hover:underline" onClick={() => setShowForgot(false)}>
                Back to login
              </button>
            </div>
            {forgotStatus && <div className="text-center text-green-700 text-sm">{forgotStatus}</div>}
          </div>
        )}
        {error && (
          <div className="mt-4 text-center text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}
