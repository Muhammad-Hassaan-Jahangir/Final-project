"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-24 px-6">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Blocklance is calling!</h1>
        <p className="text-gray-600 text-lg mb-8">Join the future of freelancing with blockchain technology.</p>
        <Link href="/user">
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
            Join us now
          </button>
        </Link>
      </section>


      {/* Hero Image */}
     <section className="px-6 md:px-20 ">
  <img
    src="https://images.unsplash.com/photo-1590650046871-92c887180603"
    alt="Team Collaboration"
    className="rounded-xl shadow-lg w-full object-cover max-w-2xl mx-auto"
  />
</section>

      {/* Why Join Section */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Why join Blocklance?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">Wide Range</h3>
            <p className="text-gray-600">Explore various projects across different industries.</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">Quick Payments</h3>
            <p className="text-gray-600">Receive your earnings swiftly and without delay.</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">Your data is protected and transactions are private.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 text-center bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Hear from our awesome users!</h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {[
            { name: "Alice Johnson", text: "Blocklance streamlined our project management." },
            { name: "Michael Smith", text: "Efficient and user-friendly, highly recommended!" },
            { name: "Sophia Lee", text: "Great tool for managing freelance teams." }
          ].map((user, idx) => (
            <div key={idx} className="bg-white shadow p-6 rounded-lg w-full max-w-sm mx-auto">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <div className="text-yellow-500 text-lg mb-2">★★★★★</div>
              <p className="text-gray-600">{user.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <input
              type="email"
              placeholder="Input your email"
              className="px-4 py-2 rounded-l-md border-none text-black"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
              Subscribe
            </button>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Blocklance. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6 text-white">
            <Link href="#">About us</Link>
            <Link href="#">Help Center</Link>
            <Link href="#">Contact us</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}