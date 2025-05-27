"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { CheckLogin } from "../../services/loginservice";
import { useRouter } from "next/navigation";
import Link from "next/link";

function LoginPage() {
  const [login, setLogin] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false); // loading state

  const router = useRouter();

  const loginFormSubmitted = async (event: any) => {
    event.preventDefault();
    if (login.email === "" || login.password === "") {
      toast.error("Email and password are required", {
        position: "top-right",
      });
      return;
    }

    try {
      setLoading(true); // start loading
      const verified = await CheckLogin(login);

      if (verified) {
        toast.success("Login successful", {
          position: "top-right",
        });

        if (login.role === "freelancer") {
          router.push("/freelancer/dashboard");
        } else if (login.role === "client") {
          router.push("/client/dashboard");
        }
      } else {
        toast.error("Invalid credentials", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error in login", error);
      toast.error("Login failed", {
        position: "top-right",
      });
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
        <h1 className="text-3xl font-extrabold text-center text-purple-700 mb-8">Login</h1>
        <form onSubmit={loginFormSubmitted} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="user_email" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="user_email"
              value={login.email}
              onChange={(event) =>
                setLogin({ ...login, email: event.target.value })
              }
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
              value={login.password}
              onChange={(event) =>
                setLogin({ ...login, password: event.target.value })
              }
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
              value={login.role}
              onChange={(event) =>
                setLogin({ ...login, role: event.target.value })
              }
              className="mt-2 w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              required
            >
              <option value="">Select Role</option>
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                setLogin({
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

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <Link
              href="/forgotPassword"
              className="text-blue-600 hover:underline hover:text-blue-800 font-medium"
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default LoginPage;
