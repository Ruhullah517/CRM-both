import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword as resetPasswordApi } from '../services/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token.');
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!token) return setError('Invalid or missing reset token.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    try {
      await resetPasswordApi(token, password);
      setSuccess('Password updated. Redirecting to login...');
      setTimeout(() => navigate('/'), 1500);
    } catch (e) {
      setError(e.response?.data?.msg || 'Failed to reset password. The link may be expired.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            className="w-full px-4 py-2 border rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-4 py-2 border rounded"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Update Password
          </button>
        </form>
        {error && <div className="mt-4 text-center text-red-600">{error}</div>}
        {success && <div className="mt-4 text-center text-green-700">{success}</div>}
      </div>
    </div>
  );
}

import React, { useState } from "react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    // Placeholder for API call
    setSubmitted(true);
    setError("");
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 24, border: "1px solid #eee", borderRadius: 8, background: "#fff" }}>
      <h2 style={{ textAlign: "center" }}>Reset Password</h2>
      {submitted ? (
        <p style={{ color: "green", textAlign: "center" }}>
          If an account with that email exists, a reset link has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: 8 }}>Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              placeholder="Enter your email"
              required
            />
          </div>
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
          <button type="submit" style={{ width: "100%", padding: 10, borderRadius: 4, background: "#007bff", color: "#fff", border: "none", fontWeight: "bold" }}>
            Send Reset Link
          </button>
        </form>
      )}
    </div>
  );
};