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

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loginFormSubmitted = async (event: any) => {
    event.preventDefault();
    
    // Form validation
    if (login.email === "") {
      toast.error("Email is required", {
        position: "top-right",
      });
      return;
    }
    
    if (login.password === "") {
      toast.error("Password is required", {
        position: "top-right",
      });
      return;
    }
    
    if (login.role === "") {
      toast.error("Please select a role", {
        position: "top-right",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await CheckLogin(login);

      if (response && response.status) {
        toast.success("Login successful", { position: "top-right" });
        if (login.role === "freelancer") {
          router.push("/freelancer/dashboard");
        } else if (login.role === "client") {
          router.push("/client/dashboard");
        } else if (login.role === "admin") {
          router.push("/admin/dashboard");
        }
      } else {
        // This will handle the case when the API returns a status: false
        toast.error(response?.message || "Invalid credentials", { position: "top-right" });
      }
    } catch (error: any) {
      console.error("Error in login", error);
      
      // Handle axios error responses
      if (error.response) {
        const errorMessage = error.response.data?.message || "Login failed";
        
        // Show specific error messages based on API response
        if (errorMessage.includes("User not found")) {
          toast.error("User not found with this email and role", { position: "top-right" });
        } else if (errorMessage.includes("Password not matched")) {
          toast.error("Incorrect password", { position: "top-right" });
        } else {
          toast.error(errorMessage, { position: "top-right" });
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please try again later", { position: "top-right" });
      } else {
        // Something happened in setting up the request
        toast.error("Login failed. Please try again", { position: "top-right" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-64px)]">
        {/* Left Side - Login Form */}
        <div className="flex flex-col justify-center px-10 md:px-20">
          <h2 className="text-2xl font-semibold text-black mb-6">
            Login to Your Account
          </h2>
          <form onSubmit={loginFormSubmitted} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={login.email}
                onChange={(e) =>
                  setLogin({ ...login, email: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={login.password}
                onChange={(e) =>
                  setLogin({ ...login, password: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role</label>
              <select
                value={login.role}
                onChange={(e) => setLogin({ ...login, role: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Role</option>
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <label className="text-sm text-gray-600">Remember Me</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 text-white font-medium py-2 rounded-md hover:bg-indigo-600 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Forgot Password */}
            <div className="text-sm text-center mt-2">
              <Link
                href="/forgotPassword"
                className="text-indigo-600 hover:underline"
              >
                Forgot your password? Recover here
              </Link>
            </div>
          </form>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:flex items-center justify-center bg-white">
          <img
            src="/crypto-login-image.png" // make sure this is in /public folder
            alt="Crypto coins"
            className="max-w-[600px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
