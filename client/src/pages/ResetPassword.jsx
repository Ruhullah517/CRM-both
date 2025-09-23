import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  requestPasswordReset,
  resetPassword as resetPasswordApi,
} from "../services/auth";

export default function ResetPasswordFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Shared states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && token.trim() === "") {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  // Handle requesting reset link
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  // Handle resetting password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) return setError("Invalid or missing reset token.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      setSuccess("Password updated. Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (e) {
      setError(
        e.response?.data?.msg ||
          "Failed to reset password. The link may be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {/* Show email form if no token */}
        {!token ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Forgot Password
            </h1>
            {submitted ? (
              <p className="text-green-600 text-center">
                If an account with that email exists, a reset link has been sent.
              </p>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            {/* Show reset password form if token exists */}
            <h1 className="text-2xl font-bold mb-6 text-center">
              Reset Password
            </h1>
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <input
                type="password"
                placeholder="New password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
            {error && <div className="mt-4 text-center text-red-600">{error}</div>}
            {success && (
              <div className="mt-4 text-center text-green-700">{success}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
