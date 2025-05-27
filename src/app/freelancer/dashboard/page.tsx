'use client';

import { useRouter } from 'next/navigation';

export default function Freelancer() {
  const router = useRouter();

  const handleViewJobs = () => {
    router.push('/freelancer/view-jobs');
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Freelancer Page</h2>
        <p className="text-gray-700 mb-4">Welcome to the Freelancer Page!</p>

        <button
          onClick={handleViewJobs}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded w-full"
        >
          View Jobs
        </button>
      </div>
    </div>
  );
}
