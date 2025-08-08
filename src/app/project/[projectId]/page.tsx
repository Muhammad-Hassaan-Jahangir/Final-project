'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BlockchainMilestone from '@/components/BlockchainMilestone';

type Project = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  category?: string;
  subcategory?: string;
  skills?: string[];
  image?: string;
  attachments?: string[];
  submissionFile?: string;
  completionNotes?: string;
  completedAt?: string;
  clientConfirmed?: boolean;
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
  createdAt: string;
  updatedAt: string;
};

export default function ProjectDetails() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showBlockchainMilestone, setShowBlockchainMilestone] = useState(false);
  const [blockchainError, setBlockchainError] = useState('');
  const [freelancerWalletAddress, setFreelancerWalletAddress] = useState('0x');
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // Handle milestone creation success
  const handleMilestoneCreated = (result: any) => {
    setShowBlockchainMilestone(false);
    // Optionally refresh the project data
    router.refresh();
  };

  useEffect(() => {
    // Fetch user role
    const fetchUserRole = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data && res.data.user) {
          setUserRole(res.data.user.role);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };
    
    fetchUserRole();
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/projects/${projectId}`, {
          withCredentials: true
        });
        setProject(res.data.project);
        
        // Add this code to fetch the freelancer's wallet address
        if (res.data.project && res.data.project.assignedTo) {
          const fetchFreelancerWalletAddress = async () => {
            try {
              const walletRes = await axios.get(`/api/user/wallet?userId=${res.data.project.assignedTo._id}`);
              if (walletRes.data && walletRes.data.walletAddress) {
                setFreelancerWalletAddress(walletRes.data.walletAddress);
              }
            } catch (err) {
              console.error('Error fetching freelancer wallet address:', err);
            }
          };
          
          fetchFreelancerWalletAddress();
        }
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.response?.data?.error || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
            <p className="text-gray-700 mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
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
          {/* Project Header with Image */}
          <div className="relative h-48 md:h-64 w-full bg-gray-200">
            <img
              src={project.image || `/project-placeholders/${(project._id.toString().charCodeAt(0) % 5) + 1}.jpg`}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `/project-placeholders/${(project._id.toString().charCodeAt(0) % 5) + 1}.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-4 md:p-6 w-full">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl md:text-2xl font-bold text-white">{project.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(project.status)}`}>
                    {project.status === 'pending' ? 'Open' : 
                     project.status === 'in_progress' ? 'In Progress' : 
                     project.status === 'completed' ? 'Completed' : 'Cancelled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Budget</div>
                <div className="text-lg font-bold">${project.budget}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Deadline</div>
                <div className="text-lg font-bold">{formatDate(project.deadline)}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Category</div>
                <div className="text-lg font-bold">{project.category || 'Uncategorized'}</div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                {project.description}
              </div>
            </div>

            {project.skills && project.skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Client Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Client</h2>
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                  <img
                    src={project.userId.profileImage || '/default-avatar.png'}
                    alt={project.userId.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <div className="font-medium">{project.userId.name}</div>
                  <div className="text-sm text-gray-500">{project.userId.email}</div>
                </div>
              </div>
            </div>

            {/* Assigned Freelancer (if any) */}
            {project.assignedTo && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Assigned Freelancer</h2>
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                    <img
                      src={project.assignedTo.profileImage || '/default-avatar.png'}
                      alt={project.assignedTo.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{project.assignedTo.name}</div>
                    <div className="text-sm text-gray-500">{project.assignedTo.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            {project.attachments && project.attachments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Attachments</h2>
                <div className="space-y-2">
                  {project.attachments.map((attachment, index) => (
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

            {/* Submission Details (if completed) */}
            {project.status === 'completed' && project.submissionFile && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Project Submission</h2>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <div className="font-medium mb-1">Completion Notes:</div>
                    <div className="text-gray-700">{project.completionNotes || 'No notes provided'}</div>
                  </div>
                  <div className="mb-3">
                    <div className="font-medium mb-1">Completed On:</div>
                    <div className="text-gray-700">{project.completedAt ? formatDate(project.completedAt) : 'Not specified'}</div>
                  </div>
                  <a
                    href={project.submissionFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Submission
                  </a>
                </div>
              </div>
            )}

            {/* Blockchain Milestone Form */}
            {showBlockchainMilestone && project.assignedTo && (
              <div className="mt-6 p-4 border rounded-lg bg-purple-50">
                <h2 className="text-lg font-semibold mb-4">Create Blockchain Milestone</h2>
                {blockchainError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {blockchainError}
                  </div>
                )}
                <BlockchainMilestone
                  freelancerAddress={freelancerWalletAddress}
                  amount={project.budget * 0.1} // Default to 10% of project budget
                  description={`Milestone for ${project.title}`}
                  onMilestoneCreated={handleMilestoneCreated}
                  onError={(error) => setBlockchainError(error.toString())}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={handleBack}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors duration-200"
              >
                Back to Dashboard
              </button>
              
              {project.status === 'pending' && (
                <Link href={`/client/job-bids/${project._id}`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200">
                  View Bids
                </Link>
              )}
              
              {project.status === 'in_progress' && (
                <Link 
                  href={userRole === 'freelancer' ? '/freelancer/ongoing-projects' : '/client/projects-progress'} 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Track Progress
                </Link>
              )}
              
              {project.status === 'in_progress' && userRole === 'client' && (
                <button
                  onClick={() => setShowBlockchainMilestone(!showBlockchainMilestone)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Create Blockchain Milestone
                </button>
              )}
              
              {project.status === 'completed' && !project.clientConfirmed && (
                <Link href="/client/ongoing-projects" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors duration-200">
                  Confirm Completion
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Remove this code that's outside the component
// Inside the useEffect hook, after fetchProject
// if (project && project.assignedTo) {
//   const fetchFreelancerWalletAddress = async () => {
//     try {
//       const res = await axios.get(`/api/user/wallet?userId=${project.assignedTo._id}`);
//       if (res.data && res.data.walletAddress) {
//         setFreelancerWalletAddress(res.data.walletAddress);
//       }
//     } catch (err) {
//       console.error('Error fetching freelancer wallet address:', err);
//     }
//   };
//   
//   fetchFreelancerWalletAddress();
// }