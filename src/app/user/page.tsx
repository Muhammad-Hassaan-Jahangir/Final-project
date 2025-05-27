"use client";
import React, { useState } from "react";
import { setuser } from "../../services/userservice";
import { toast } from "react-toastify";

function SignUpPage() {
  const [sign, setSign] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false); // loading state

  const SubmitUser = async (event: any) => {
    event.preventDefault();
    setLoading(true); // start loading
    try {
      await setuser(sign);
      toast.success("User added successfully", {
        position: "top-center",
      });
      console.log("User added successfully", sign);
      setSign({
        name: "",
        email: "",
        password: "",
        role: "",
      });
    } catch (error) {
      toast.error(`Error in adding user`, {
        position: "top-right",
      });
      console.error("Error in adding user", error);
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-20 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://illustrations.popsy.co/white/freelancer.svg"
          alt="Freelancer background"
          className="absolute bottom-20 right-0 w-[500px] opacity-100 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-black opacity-10"></div>
      </div>

      <div className="z-10 relative bg-white shadow-2xl rounded-3xl p-10 md:p-12 w-full max-w-lg">
        <h1 className="text-3xl font-extrabold text-center text-purple-700 mb-8">Sign Up</h1>
        <form onSubmit={SubmitUser} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="user_name" className="block text-sm font-semibold text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="user_name"
              value={sign.name}
              onChange={(event) => setSign({ ...sign, name: event.target.value })}
              className="mt-2 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder-gray-400"
              placeholder="Your name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="user_email" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="user_email"
              value={sign.email}
              onChange={(event) => setSign({ ...sign, email: event.target.value })}
              className="mt-2 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder-gray-400"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="user_password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="user_password"
              value={sign.password}
              onChange={(event) => setSign({ ...sign, password: event.target.value })}
              className="mt-2 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder-gray-400"
              placeholder="Enter password"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="user_role" className="block text-sm font-semibold text-gray-700">
              Role
            </label>
            <select
              id="user_role"
              value={sign.role}
              onChange={(event) => setSign({ ...sign, role: event.target.value })}
              className="mt-2 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              required
            >
              <option value="">Select Role</option>
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </button>

            <button
              type="reset"
              onClick={() =>
                setSign({
                  name: "",
                  email: "",
                  password: "",
                  role: "",
                })
              }
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-300"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default SignUpPage;
