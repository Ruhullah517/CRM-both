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

export default ResetPassword; 