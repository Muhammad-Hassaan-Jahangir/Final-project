"use client";

import React, { useState } from "react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/forgotPassword", { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10 space-y-16 text-gray-800">
      
      {/* Section 1: Password Recovery */}
      <section className="max-w-xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Password Recovery</h2>
        <p className="text-sm md:text-base mb-4">
          To recover your password, please enter the email address associated with your account.
          We will send you instructions on how to reset your password. Rest assured, your information is secure with us.
        </p>
        <input
          type="email"
          placeholder="Email address"
          className="w-full border border-gray-300 px-4 py-2 rounded-md mb-4 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#6C63FF] hover:bg-[#574fe1] text-white px-5 py-2 rounded-md disabled:opacity-50 transition"
        >
          {loading ? "Sending..." : "Send Instructions"}
        </button>
      </section>

      {/* Section 2: Forgot Password */}
      <section className="max-w-xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-3">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden mb-3">
            <span className="px-3 text-gray-500">📧</span>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 outline-none text-black"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#6C63FF] hover:bg-[#574fe1] text-white px-5 py-2 rounded-md disabled:opacity-50 transition"
          >
            {loading ? "Sending..." : "Send Recovery Email"}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-1">Please check your inbox for recovery instructions.</p>
      </section>

      {/* Section 3: Your Security Matters */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-4">
        <img
          src="/security-lock.png" // replace with your image path
          alt="Security"
          className="w-full md:max-w-md rounded-md shadow"
        />
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Your Security Matters</h2>
          <p className="text-sm md:text-base text-gray-600">
            Rest assured, your personal information is safe with us.
            A recovery email will be sent to you with instructions to securely reset your password.
          </p>
        </div>
      </section>

      {/* Optional message display */}
      {message && <p className="text-center text-green-600 font-medium">{message}</p>}
      {error && <p className="text-center text-red-600 font-medium">{error}</p>}
    </div>
  );
}
