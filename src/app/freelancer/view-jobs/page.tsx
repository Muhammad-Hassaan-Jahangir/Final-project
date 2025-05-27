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

export default function FreelancerViewJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ amount: '', coverLetter: '' });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('/api/jobs');
        setJobs(res.data.jobs || []);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleBidSubmit = async (jobId: string) => {
    try {
      await axios.post(
        '/api/bids',
        {
          jobId,
          amount: Number(formData.amount),
          coverLetter: formData.coverLetter,
        },
        {
          withCredentials: true,
        }
      );
      alert('Bid submitted successfully!');
      setShowForm(null);
      setFormData({ amount: '', coverLetter: '' });
    } catch (err) {
      alert('Failed to submit bid.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Available Jobs</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="border p-4 rounded shadow bg-white"
          >
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-700 mb-2">{job.description}</p>
            <div className="text-sm text-gray-600 mb-3">
              <p>💰 Budget: ${job.budget}</p>
              <p>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
            </div>

            <button
              onClick={() =>
                setShowForm(showForm === job._id ? null : job._id)
              }
              className="bg-blue-600 text-white px-4 py-1 rounded"
            >
              {showForm === job._id ? 'Cancel' : 'Bid'}
            </button>

            {showForm === job._id && (
              <div className="mt-3 border-t pt-3">
                <input
                  type="number"
                  placeholder="Your bid amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="block w-full p-2 border rounded mb-2"
                />
                <textarea
                  placeholder="Cover letter"
                  value={formData.coverLetter}
                  onChange={(e) =>
                    setFormData({ ...formData, coverLetter: e.target.value })
                  }
                  className="block w-full p-2 border rounded mb-2"
                />
                <button
                  onClick={() => handleBidSubmit(job._id)}
                  className="bg-green-600 text-white px-4 py-1 rounded"
                >
                  Submit Bid
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
