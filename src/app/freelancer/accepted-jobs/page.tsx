'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Job = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
};

export default function AcceptedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
              <div className="text-sm text-gray-600">
                <p>💰 Budget: ${job.budget}</p>
                <p>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
