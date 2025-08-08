'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Project = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  skills: string[];
  hasBid?: boolean;
  userId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
};

type Bid = {
  _id: string;
  amount: number;
  coverLetter: string;
  status: string;
  createdAt: string;
  jobId: Project;
};

export default function FreelancerProjects() {
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [availableJobs, setAvailableJobs] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('assigned');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/freelancer/projects');
      setAssignedProjects(res.data.assignedProjects || []);
      setBids(res.data.bids || []);
      setAvailableJobs(res.data.availableJobs || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Open</span>;
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">In Progress</span>;
      case 'completed':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const getBidStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>;
      case 'accepted':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Accepted</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejected</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <button
          onClick={() => router.push('/freelancer/dashboard')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assigned' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Assigned Projects ({assignedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bids' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Your Bids ({bids.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'available' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Available Jobs ({availableJobs.length})
          </button>
        </nav>
      </div>

      {/* Assigned Projects */}
      {activeTab === 'assigned' && (
        <div>
          {assignedProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-4">You don't have any assigned projects yet.</p>
              <Link href="/freelancer/view-jobs">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded">
                  Find Jobs to Bid
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {assignedProjects.map((project) => (
                <div key={project._id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
                      <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>💰 Budget: ${project.budget}</span>
                        <span>📅 Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-medium mb-2">Client</h3>
                    <div className="flex items-center gap-3">
                      {project.userId?.profileImage ? (
                        <img
                          src={project.userId.profileImage}
                          alt={project.userId.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">{project.userId?.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{project.userId?.name}</p>
                      </div>
                      <Link href={`/chat/${project.userId?._id}`}>
                        <button className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                          Chat
                        </button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Link href={`/project/${project._id}`}>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                        View Details
                      </button>
                    </Link>
                    {project.status === 'in_progress' && (
                      <Link href={`/freelancer/ongoing-projects`}>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                          Manage Project
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bids */}
      {activeTab === 'bids' && (
        <div>
          {bids.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-4">You haven't placed any bids yet.</p>
              <Link href="/freelancer/view-jobs">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded">
                  Find Jobs to Bid
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bids.map((bid) => (
                <div key={bid._id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{bid.jobId?.title || 'Untitled Project'}</h2>
                      <p className="text-gray-600 mb-3 line-clamp-2">{bid.jobId?.description || 'No description available'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>💰 Your Bid: ${bid.amount}</span>
                        <span>📅 Submitted: {new Date(bid.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {getBidStatusBadge(bid.status)}
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-medium mb-2">Your Cover Letter</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{bid.coverLetter}</p>
                  </div>

                  <div className="flex justify-end">
                    {bid.jobId && bid.jobId._id ? (
                      <Link href={`/project/${bid.jobId._id}`}>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                          View Project
                        </button>
                      </Link>
                    ) : (
                      <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
                        Project Unavailable
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Available Jobs */}
      {activeTab === 'available' && (
        <div>
          {availableJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-4">No available jobs match your skills.</p>
              <Link href="/freelancer/profile">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded">
                  Update Your Skills
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {availableJobs.map((job) => (
                <div key={job._id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                      <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>💰 Budget: ${job.budget}</span>
                        <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {job.hasBid ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Already Bid</span>
                      ) : (
                        getStatusBadge(job.status)
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Link href={`/project/${job._id}`}>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                        {job.hasBid ? 'View Your Bid' : 'Place Bid'}
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}