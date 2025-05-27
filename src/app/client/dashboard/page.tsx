'use client';
import { useRouter } from 'next/navigation';

export default function Client() {
    const router = useRouter();

    const handlePostJob = () => {
        router.push('/client/post-job');
    };

    const handleViewJobs = () => {
        router.push('/client/view-jobs'); // You'll route this to your posted jobs page
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4">Client Page</h2>
                <p className="text-gray-700 mb-4">Welcome to the Client Page!</p>
                
                <button 
                    onClick={handlePostJob}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-3"
                >
                    Post Job
                </button>

                <button 
                    onClick={handleViewJobs}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                    View Posted Jobs
                </button>
            </div>
        </div>
    );
}
