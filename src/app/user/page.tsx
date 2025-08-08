"use client";
import React, { useState } from "react";
import { setuser } from "../../services/userservice";
import { toast } from "react-toastify";
import Link from "next/link";

function SignUpPage() {
  const [sign, setSign] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  const SubmitUser = async (event: any) => {
    event.preventDefault();
    setLoading(true);
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
    } catch (error: any) {
      // Display the specific error message from the API if available
      const errorMessage = error.response?.data?.message || "Error in adding user";
      toast.error(errorMessage, {
        position: "top-right",
      });
      console.error("Error in adding user", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Background */}
      <div className="hidden lg:flex w-1/5 bg-cover bg-center" style={{ backgroundImage: "url('/signup-left.png')" }}></div>

      {/* Center Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-center text-black">Create Account</h2>
          <p className="text-center text-gray-600 text-sm">
            Join us and start connecting with clients or freelancers today!
          </p>

          <form onSubmit={SubmitUser} className="space-y-4">
             {/* name */}
            <div>
              <input
                type="test"
                placeholder="Enter your name"
                value={sign.name}
                onChange={(e) => setSign({ ...sign, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Your email address"
                value={sign.email}
                onChange={(e) => setSign({ ...sign, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Create a secure password"
                value={sign.password}
                onChange={(e) => setSign({ ...sign, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Role */}
            <div>
              <select
                value={sign.role}
                onChange={(e) => setSign({ ...sign, role: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-700"
                required
              >
                <option value="">Select Role</option>
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center text-sm text-gray-700">
              <input type="checkbox" className="mr-2" required />
              <span>
                I agree with{" "}
                <a href="#" className="text-indigo-600 hover:underline">
                  Terms & Conditions
                </a>
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

         

          {/* Already Registered */}
          <p className="text-center text-sm text-gray-600 mt-2">
            Already registered?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* Right Background */}
      <div className="hidden lg:flex w-1/5 bg-cover bg-center" style={{ backgroundImage: "url('/signup-right.png')" }}></div>
    </div>
  );
}

export default SignUpPage;
