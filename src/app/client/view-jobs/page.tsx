'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
type Job = {
  assignedTo: any;
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  image?: string;
};

export default function ViewJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('/api/client/view-jobs', {
          withCredentials: true,
        });
        setJobs(res.data.jobs || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (jobId: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this job?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/client/view-jobs/${jobId}`, {
        withCredentials: true,
      });
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      alert('Failed to delete the job.');
    }
  };

  const handleEdit = (jobId: string) => {
    router.push(`/client/edit-job/${jobId}`);
  };

  const handleViewBids = (jobId: string) => {
    router.push(`/client/job-bids/${jobId}`);
  };

  const handleChat = (jobId: string) => {
    router.push(`/client/job-chat/${jobId}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Posted Jobs</h1>

      {loading && <p className="text-gray-600">Loading jobs...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && jobs.length === 0 && (
        <p className="text-gray-700">You haven't posted any jobs yet.</p>
      )}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Project image */}
              <div className="w-full md:w-1/4 h-40 bg-gray-100 rounded overflow-hidden">
                <img 
                  src={job.image && job.image !== '' 
                    ? job.image 
                    : `/project-placeholders/${(parseInt(job._id.toString().substring(0, 8), 16) % 5) + 1}.jpg`}
                  alt={job.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Project details */}
              <div className="w-full md:w-3/4">
                <h2 className="text-xl font-semibold mb-1">{job.title}</h2>
                <p className="text-gray-700 mb-2">{job.description}</p>
                <div className="text-sm text-gray-600 mb-3">
                  <p>💰 Budget: ${job.budget}</p>
                  <p>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleEdit(job._id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(job._id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-1 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => handleViewBids(job._id)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-1 rounded"
              >
                View Bids
              </button>
             {job.assignedTo?._id && (
  <Link href={`/chat/${job.assignedTo._id}`}>
    <button>Chat</button>
  </Link>
)}


            
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
