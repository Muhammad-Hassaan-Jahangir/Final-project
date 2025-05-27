"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-opacity-90 backdrop-blur-md shadow-md rounded-b-lg border-b border-white text-white">
      <Link href="/">
        <h1
          className="text-3xl font-extrabold cursor-pointer select-none"
          style={{
            textShadow: "2px 2px 8px rgba(289, 192, 246, 10.85)",
          }}
        >
          BlockLance
        </h1>
      </Link>
      <div className="space-x-4">
        <Link href="/login">
          <button className="px-5 py-2 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 transition">
            Login
          </button>
        </Link>
        <Link href="/user">
          <button className="px-5 py-2 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition">
            Register
          </button>
        </Link>
      </div>
    </nav>
  );
}
