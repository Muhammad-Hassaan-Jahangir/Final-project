'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminReleasePayment from '@/components/AdminReleasePayment';

type Job = {
  _id: string;
  title: string;
  budget: number;
  status: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  description?: string;
  milestones?: Milestone[];
};

type Milestone = {
  _id: string;
  title: string;
  blockchainId: string;
  amount: number;
  status: string;
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  // Add these missing state variables
  const [showReleasePayment, setShowReleasePayment] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [jobMilestones, setJobMilestones] = useState<Milestone[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/jobs');
      const jobsData = res.data.jobs;
      
      // Fetch milestones for each job
      const jobsWithMilestones = await Promise.all(
        jobsData.map(async (job: Job) => {
          try {
            const milestonesRes = await axios.get(`/api/milestones`, {
              params: { projectId: job._id }
            });
            
            return {
              ...job,
              milestones: milestonesRes.data.milestones || []
            };
          } catch (error) {
            console.error(`Failed to fetch milestones for job ${job._id}:`, error);
            return {
              ...job,
              milestones: []
            };
          }
        })
      );
      
      setJobs(jobsWithMilestones);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (jobId: string) => {
    try {
      const res = await axios.get(`/api/job/${jobId}`);
      setSelectedJob(res.data.job);
      
      // Fetch milestones for this job
      try {
        const milestonesRes = await axios.get(`/api/milestones`, {
          params: { projectId: jobId }
        });
        
        if (milestonesRes.data.milestones && milestonesRes.data.milestones.length > 0) {
          setJobMilestones(milestonesRes.data.milestones);
        } else {
          setJobMilestones([]);
        }
      } catch (error) {
        console.error('Failed to fetch milestones:', error);
        setJobMilestones([]);
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      await axios.put('/api/admin/jobs', {
        jobId,
        action: 'delete'
      });
      // Refresh the job list
      fetchJobs();
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  // Add these missing handler functions
  const handlePaymentReleased = async (result: any) => {
    console.log('Payment released successfully:', result);
    setShowReleasePayment(false);
    // Refresh the job list to show updated status
    fetchJobs();
  };

  const handleReleaseError = (error: any) => {
    console.error('Error releasing payment:', error);
    alert(`Error releasing payment: ${error}`);
  };

  // Updated function to handle showing the release payment modal with correct API endpoint
  const handleShowReleasePayment = async (jobId: string) => {
    try {
      // Use the correct API endpoint for milestones
      const res = await axios.get(`/api/milestones`, {
        params: { projectId: jobId }
      });
      
      if (res.data.milestones && res.data.milestones.length > 0) {
        // Get the first milestone that uses blockchain and is not completed
        const milestone = res.data.milestones.find(
          (m: Milestone) => m.blockchainId && m.status !== 'completed'
        );
        
        if (milestone) {
          setSelectedMilestone(milestone);
          setShowReleasePayment(true);
        } else {
          alert('No active blockchain milestone found for this job');
        }
      } else {
        alert('No milestones found for this job');
      }
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      alert('Failed to fetch milestones');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Jobs</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => {
                // Find the first milestone with a blockchain ID if available
                const activeMilestone = job.milestones?.find(m => m.blockchainId && m.status !== 'completed');
                const completedMilestone = job.milestones?.find(m => m.blockchainId && m.status === 'completed');
                const anyMilestone = job.milestones?.[0];
                const displayMilestone = activeMilestone || completedMilestone || anyMilestone;
                
                return (
                  <tr key={job._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.userId?.name || 'Unknown User'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${job.budget}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-800' : job.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {displayMilestone ? (
                        <div className="text-sm text-gray-500">
                          {displayMilestone.blockchainId ? (
                            <span className="font-mono text-xs bg-gray-100 p-1 rounded">
                              {displayMilestone.blockchainId.substring(0, 10)}...
                            </span>
                          ) : (
                            <span className="font-mono text-xs bg-gray-100 p-1 rounded">
                              {displayMilestone._id.substring(0, 10)}...
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">No milestone</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleView(job._id)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Job Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedJob.title}</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Posted by: {selectedJob.userId?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-500 mb-1">Budget: ${selectedJob.budget}</p>
                <p className="text-sm text-gray-500 mb-1">Status: {selectedJob.status}</p>
                <p className="text-sm text-gray-500 mb-4">Posted on: {new Date(selectedJob.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{selectedJob.description || 'No description provided.'}</p>
              </div>
              
              {/* Display Milestones Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Milestones</h3>
                {jobMilestones.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {jobMilestones.map((milestone) => (
                      <div key={milestone._id} className="mb-3 p-3 border border-gray-200 rounded bg-white">
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-gray-600">Amount: ${milestone.amount}</p>
                        <p className="text-sm text-gray-600">Status: {milestone.status}</p>
                        {milestone.blockchainId && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Blockchain ID:</span> {milestone.blockchainId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No milestones found for this job.</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Release Payment Modal */}
      {showReleasePayment && selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Release Payment</h2>
            <AdminReleasePayment
              milestoneId={selectedMilestone._id}
              blockchainId={selectedMilestone.blockchainId}
              amount={selectedMilestone.amount}
              jobTitle={selectedMilestone.title}
              onPaymentReleased={handlePaymentReleased}
              onError={handleReleaseError}
            />
            <button
              onClick={() => setShowReleasePayment(false)}
              className="mt-4 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this job? This action cannot be undone.</p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmation)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}