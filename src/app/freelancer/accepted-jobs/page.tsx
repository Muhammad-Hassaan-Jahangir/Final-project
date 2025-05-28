'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Job = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
};

export default function AcceptedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcceptedJobs = async () => {
      try {
        const res = await axios.get('/api/freelancer/accepted-jobs', {
          withCredentials: true,
        });
        setJobs(res.data.jobs || []);
      } catch (err) {
        setError('Failed to load accepted jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedJobs();
  }, []);

  const handleComplete = async (jobId: string) => {
    setUpdating(jobId);
    try {
      await axios.put(`/api/freelancer/complete-job/${jobId}`, {}, {
        withCredentials: true,
      });
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, status: 'completed' } : job
        )
      );
    } catch (err) {
      alert('Failed to complete job');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Accepted Jobs</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {jobs.length === 0 ? (
        <p className="text-gray-700">You haven't been assigned any jobs yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-xl font-semibold mb-1">{job.title}</h2>
              <p className="text-gray-700 mb-2">{job.description}</p>
              <div className="text-sm text-gray-600 mb-2">
                <p>💰 Budget: ${job.budget}</p>
                <p>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                <p>📌 Status: <span className="font-medium capitalize">{job.status}</span></p>
              </div>
              {job.status !== 'completed' && (
                <button
                  onClick={() => handleComplete(job._id)}
                  disabled={updating === job._id}
                  className={`${
                    updating === job._id ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
                  } text-white px-4 py-1 rounded`}
                >
                  {updating === job._id ? 'Updating...' : 'Mark as Completed'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
