'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type Job = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  basicBudget?: number;
  expertBudget?: number;
  deadline: string;
  category?: string;
  subcategory?: string;
  skills?: string[];
  jobType?: string;
  additionalRequirements?: string;
  attachments?: string[];
  image?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
};

export default function FreelancerViewJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ amount: '', coverLetter: '' });
  const router = useRouter();

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

  const handleChatWithClient = (clientId: string) => {
    router.push(`/chat/${clientId}`);
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
            {job.image && (
              <div className="mb-3">
                <img 
                  src={job.image} 
                  alt={job.title} 
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-700 mb-2">{job.description}</p>
            
            {/* Client Information */}
            <div className="bg-gray-50 p-3 rounded mb-3">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Posted by:</h3>
              <div className="flex items-center space-x-3">
                {job.userId?.profileImage ? (
                  <img
                    src={job.userId.profileImage}
                    alt={job.userId.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {job.userId?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{job.userId?.name}</p>
                  <p className="text-sm text-gray-600">{job.userId?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              <p>💰 Budget: ${job.budget}</p>
              {job.basicBudget && job.expertBudget && (
                <div className="ml-4 text-xs">
                  <p>Basic Budget: ${job.basicBudget}</p>
                  <p>Expert Budget: ${job.expertBudget}</p>
                </div>
              )}
              <p>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
              {job.category && <p>🏷️ Category: {job.category}</p>}
              {job.subcategory && <p>🔖 Subcategory: {job.subcategory}</p>}
              {job.jobType && <p>💼 Job Type: {job.jobType}</p>}
              
              {job.skills && job.skills.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Skills Required:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {job.additionalRequirements && (
                <div className="mt-2">
                  <p className="font-medium">Additional Requirements:</p>
                  <p className="text-gray-700">{job.additionalRequirements}</p>
                </div>
              )}
              
              {job.attachments && job.attachments.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Attachments:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {job.attachments.map((attachment, index) => (
                      <a 
                        key={index} 
                        href={attachment} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <span>📎</span>
                        <span>Attachment {index + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setShowForm(showForm === job._id ? null : job._id)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {showForm === job._id ? 'Cancel' : 'Bid'}
              </button>
              
              <button
                onClick={() => handleChatWithClient(job.userId._id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <span>💬</span>
                <span>Chat with Client</span>
              </button>
            </div>

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
