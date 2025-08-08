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
  submissionFile?: string;
  completionNotes?: string;
  completedAt?: string;
  clientConfirmed: boolean;
  image?: string;
  userId: {
    _id: string;
    name: string;
    profileImage?: string;
    email: string;
  };
};

export default function FreelancerOngoingProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState({ file: '', notes: '' });
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchOngoingProjects();
  }, []);

  const fetchOngoingProjects = async () => {
    try {
      const res = await axios.get('/api/freelancer/accepted-jobs');
      const allJobs = res.data.jobs;
      
      // Filter for in-progress and completed projects
      const ongoingProjects = allJobs.filter((project: Project) => 
        project.status === 'in_progress' || project.status === 'completed'
      );
      
      setProjects(ongoingProjects);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (projectId: string) => {
    setUpdating(projectId);
    try {
      await axios.put(`/api/freelancer/complete-job/${projectId}`, submissionData);
      // Refresh the projects list
      await fetchOngoingProjects();
      setShowSubmissionModal(null);
      setSubmissionData({ file: '', notes: '' });
      alert('Project marked as completed!');
    } catch (err) {
      alert('Failed to complete project');
    } finally {
      setUpdating(null);
    }
  };

  const openSubmissionModal = (projectId: string) => {
    setShowSubmissionModal(projectId);
  };

  const closeSubmissionModal = () => {
    setShowSubmissionModal(null);
    setSubmissionData({ file: '', notes: '' });
  };

  const getStatusBadge = (status: string, clientConfirmed: boolean) => {
    switch (status) {
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">In Progress</span>;
      case 'completed':
        return clientConfirmed ? 
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Completed & Confirmed</span> :
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">Completed (Awaiting Confirmation)</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">{status}</span>;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Ongoing Projects</h1>
        <button
          onClick={() => router.push('/freelancer/dashboard')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You don't have any ongoing projects.</p>
          <Link href="/freelancer/view-jobs">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
              Find Jobs to Bid
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 mb-4">
                {/* Project image */}
                <div className="w-full md:w-1/4 h-48 bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={project.image && project.image !== '' 
                      ? project.image 
                      : `/project-placeholders/${(parseInt(project._id.toString().substring(0, 8), 16) % 5) + 1}.jpg`}
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Project details */}
                <div className="w-full md:w-3/4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>💰 Budget: ${project.budget}</span>
                        <span>📅 Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(project.status, project.clientConfirmed)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium mb-2">Client</h3>
                <div className="flex items-center gap-3">
                  {project.userId?.profileImage && (
                    <img
                      src={project.userId.profileImage}
                      alt={project.userId.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{project.userId?.name}</p>
                    <p className="text-sm text-gray-600">{project.userId?.email}</p>
                  </div>
                  <Link href={`/chat/${project.userId?._id}`}>
                    <button className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                      Chat
                    </button>
                  </Link>
                </div>
              </div>

              {/* Submission Details (if completed) */}
              {project.status === 'completed' ? (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-2 text-green-800">Work Submitted</h3>
                  {project.completedAt && (
                    <p className="text-sm text-gray-600 mb-2">
                      Completed on: {new Date(project.completedAt).toLocaleDateString()}
                    </p>
                  )}
                  {project.submissionFile && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">Your Submission:</p>
                      <p className="text-sm text-blue-600">{project.submissionFile}</p>
                    </div>
                  )}
                  {project.completionNotes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium">Your Notes:</p>
                      <p className="text-sm text-gray-700">{project.completionNotes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {project.clientConfirmed ? (
                      <span className="text-green-600 font-medium">✓ Confirmed by client</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">⏳ Awaiting client confirmation</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    onClick={() => openSubmissionModal(project._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Submit Work
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Submit Your Work</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Submission File/Link</label>
                <input
                  type="text"
                  value={submissionData.file}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, file: e.target.value }))}
                  placeholder="Enter file URL, Google Drive link, or description"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Completion Notes</label>
                <textarea
                  value={submissionData.notes}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe what you've completed, any notes for the client..."
                  rows={4}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleComplete(showSubmissionModal)}
                disabled={updating === showSubmissionModal}
                className={`flex-1 ${
                  updating === showSubmissionModal 
                    ? 'bg-gray-400' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white py-2 rounded`}
              >
                {updating === showSubmissionModal ? 'Submitting...' : 'Submit & Mark Complete'}
              </button>
              
              <button
                onClick={closeSubmissionModal}
                disabled={updating === showSubmissionModal}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}