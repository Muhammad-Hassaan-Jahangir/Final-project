'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Job = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  assignedTo: {
    name: string;
    email: string;
  };
};

export default function ConfirmJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('/api/client/confirm-jobs', {
          withCredentials: true,
        });
        setJobs(res.data.jobs || []);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

 const handleConfirm = async (jobId: string) => {
  console.log("📤 Sending PUT request to confirm job:", jobId);
  try {
    const response = await axios.put(`/api/client/confirm-job/${jobId}`, {}, {
      withCredentials: true,
    });
    console.log("✅ Job confirmed response:", response.data);
    alert("Job confirmed");
    setJobs((prev) => prev.filter((job) => job._id !== jobId));
  } catch (err: any) {
    console.error("❌ Error confirming job:", err.response?.data || err.message);
    alert("Failed to confirm job");
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Jobs Needing Confirmation</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {jobs.length === 0 ? (
        <p className="text-gray-700">No jobs awaiting confirmation.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-700">{job.description}</p>
              <p className="text-sm text-gray-600 mb-1">By: {job.assignedTo?.name} ({job.assignedTo?.email})</p>
              <p className="text-sm text-gray-600 mb-2">
                💰 ${job.budget} | 📅 {new Date(job.deadline).toLocaleDateString()}
              </p>

              <button
                onClick={() => handleConfirm(job._id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
              >
                Confirm Completion
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
