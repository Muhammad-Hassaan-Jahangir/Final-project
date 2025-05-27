"use client";
import Link from "next/link";
import Navbar from "./../components/Navbar"; // ✅ Add this line
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between p-10 md:p-20">
        <div className="md:w-1/2">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Connect with the Best Freelancers</h2>
          <p className="text-lg mb-6">Post jobs, hire talent, or offer your skills. All in one place — fast, secure, and simple.</p>
          <Link href="/user">
            <button className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-100 transition duration-300">
              Get Started
            </button>
          </Link>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0">
          <img
            src="https://illustrations.popsy.co/white/freelancer.svg"
            alt="Freelancer illustration"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-white bg-opacity-10 backdrop-blur-md">
        &copy; {new Date().getFullYear()} Blocklance. All rights reserved.
      </footer>
    </main>
  );
}
