"use client";
import React from "react";
import { Loader2 } from "lucide-react"; // Lucide icons are supported in Next.js

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="flex items-center space-x-4 animate-pulse">
        <Loader2 className="w-10 h-10 animate-spin text-white drop-shadow-lg" />
        <h2 className="text-3xl font-bold drop-shadow-md">Loading BlockLance...</h2>
      </div>
      <p className="mt-4 text-sm opacity-80">Please wait while we get things ready for you.</p>
    </div>
  );
}
