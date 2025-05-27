"use client";

import React, { useState } from "react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // new loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true); // start loading

    try {
      const res = await axios.post("/api/forgotPassword", { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || "Kuch galat hua");
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-20 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://illustrations.popsy.co/white/freelancer.svg"
          alt="Freelancer background"
          className="absolute bottom-20 right-0 w-[500px] opacity-100 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-black opacity-10"></div>
      </div>

      <div className="z-10 relative bg-white shadow-2xl rounded-3xl p-10 md:p-12 w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-6">
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Enter your email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder-gray-400"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-green-600 font-semibold text-center">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-red-600 font-semibold text-center">{error}</p>
        )}
      </div>
    </main>
  );
}
