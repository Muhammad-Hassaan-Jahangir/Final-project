'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  status?: string;
};

export default function JobDetails() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/job/${jobId}`, {
          withCredentials: true
        });
        setJob(res.data.job);
      } catch (err: any) {
        console.error('Error fetching job:', err);
        setError(err.response?.data?.error || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleBidSubmit = async () => {
    router.push(`/freelancer/view-jobs?bidFor=${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Job Not Found</h1>
            <p className="text-gray-700 mb-4">The job you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={handleBack}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Job Header with Image */}
          <div className="relative h-48 md:h-64 w-full bg-gray-200">
            <img
              src={job.image || `/project-placeholders/${(job._id.toString().charCodeAt(0) % 5) + 1}.jpg`}
              alt={job.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `/project-placeholders/${(job._id.toString().charCodeAt(0) % 5) + 1}.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-4 md:p-6 w-full">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl md:text-2xl font-bold text-white">{job.title}</h1>
                  {job.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status === 'pending' ? 'Open' : 
                      job.status === 'in_progress' ? 'In Progress' : 
                      job.status === 'completed' ? 'Completed' : 'Unknown'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Budget</div>
                <div className="text-lg font-bold">${job.budget}</div>
                {job.basicBudget && job.expertBudget && (
                  <div className="text-xs text-gray-500 mt-1">
                    <div>Basic: ${job.basicBudget}</div>
                    <div>Expert: ${job.expertBudget}</div>
                  </div>
                )}
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Deadline</div>
                <div className="text-lg font-bold">{formatDate(job.deadline)}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Category</div>
                <div className="text-lg font-bold">{job.category || 'Uncategorized'}</div>
                {job.subcategory && (
                  <div className="text-xs text-gray-500 mt-1">{job.subcategory}</div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                {job.description}
              </div>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.jobType && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Job Type</h2>
                <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
                  {job.jobType}
                </div>
              </div>
            )}

            {job.additionalRequirements && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Additional Requirements</h2>
                <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
                  {job.additionalRequirements}
                </div>
              </div>
            )}

            {/* Client Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Client</h2>
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                  <img
                    src={job.userId.profileImage || '/default-avatar.png'}
                    alt={job.userId.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <div className="font-medium">{job.userId.name}</div>
                  <div className="text-sm text-gray-500">{job.userId.email}</div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {job.attachments && job.attachments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Attachments</h2>
                <div className="space-y-2">
                  {job.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                      Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={handleBack}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors duration-200"
              >
                Back
              </button>
              
              {(!job.status || job.status === 'pending') && (
                <button
                  onClick={handleBidSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Submit a Bid
                </button>
              )}
              
              <Link 
                href={`/chat/${job.userId._id}`} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Chat with Client
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}