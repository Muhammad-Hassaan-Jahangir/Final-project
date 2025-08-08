"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/reset-password", { token, password });
      setMsg(res.data.message);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Reset Your Password</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C63FF] hover:bg-indigo-600 text-white font-semibold py-2 rounded-md transition disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {msg && <p className="text-center text-green-600 font-medium">{msg}</p>}
          {error && <p className="text-center text-red-600 font-medium">{error}</p>}

          <div className="text-center mt-4">
            <a href="/login" className="text-[#6C63FF] text-sm hover:underline">
              Back to Login
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex flex-1 justify-center items-center bg-gray-100">
        <img
          src="/crypto-login-image.png" // Replace this with your own image path
          alt="Crypto"
          className="object-cover max-h-[500px] rounded-md"
        />
      </div>
    </div>
  );
}
