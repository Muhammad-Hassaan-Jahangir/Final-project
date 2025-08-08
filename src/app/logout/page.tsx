'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LogoutPage() {
  const router = useRouter();
  
  // Auto-redirect to login page after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">You've been logged out</h1>
          <p className="text-gray-600">Thank you for using Blocklance</p>
        </div>
        
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <p className="text-gray-500 mb-6">You will be redirected to the login page in 5 seconds...</p>
        
        <div className="flex flex-col space-y-3">
          <Link href="/login" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200">
            Login Again
          </Link>
          <Link href="/" className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}