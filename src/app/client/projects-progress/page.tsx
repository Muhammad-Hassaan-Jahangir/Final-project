'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import WalletConnect from '@/components/WalletConnect';

type Milestone = {
  _id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline: string;
  description?: string;
  useBlockchain?: boolean;
  blockchainId?: string;
  transactionHash?: string;
};

type Project = {
  _id: string;
  title: string;
  description: string;
  status: string;
  milestones: Milestone[];
};

type Feedback = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profileImage: string;
  };
  comment: string;
  createdAt: string;
};

type Update = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profileImage: string;
  };
  content: string;
  createdAt: string;
};

export default function ProjectProgress() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newUpdate, setNewUpdate] = useState('');
  const [feedback, setFeedback] = useState<(Feedback | Update)[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const router = useRouter();

  // Fetch projects with milestones
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/client/projects');
        setProjects(res.data.projects);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch feedback and updates when a project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchFeedbackAndUpdates(selectedProject._id);
    }
  }, [selectedProject]);

  const fetchFeedbackAndUpdates = async (projectId: string) => {
    try {
      setLoadingFeedback(true);
      
      // Fetch feedback
      const feedbackRes = await axios.get(`/api/client/project-feedback?projectId=${projectId}`);
      
      // Fetch updates
      const updatesRes = await axios.get(`/api/client/project-updates?projectId=${projectId}`);
      
      // Combine and sort by date
      const combinedFeedback = [
        ...feedbackRes.data.feedback,
        ...updatesRes.data.updates
      ].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setFeedback(combinedFeedback);
      setLoadingFeedback(false);
    } catch (err) {
      console.error('Error fetching feedback and updates:', err);
      setLoadingFeedback(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim() || !selectedProject) return;
    
    try {
      const res = await axios.post('/api/client/project-updates', {
        projectId: selectedProject._id,
        content: newUpdate
      });
      
      // Add the new update to the feedback list
      setFeedback([res.data.update, ...feedback]);
      setNewUpdate('');
    } catch (err) {
      console.error('Error adding update:', err);
      alert('Failed to add update. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">Project Progress</h1>
        <div>
          <button 
            onClick={() => router.push('/client/dashboard')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2"
          >
            Dashboard
          </button>
          <button 
            onClick={() => router.push('/client/post-job')}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Post New Job
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Selection */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Project Selection</h2>
          {projects.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No projects found. Start by posting a new job.
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(project => (
                <div 
                  key={project._id}
                  className={`p-3 rounded cursor-pointer ${selectedProject?._id === project._id ? 'bg-purple-100 border-l-4 border-purple-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                  onClick={() => handleProjectSelect(project)}
                >
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-gray-600 truncate">{project.description}</p>
                  <div className="flex justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {project.status === 'in_progress' ? 'In Progress' : project.status}
                    </span>
                    <span className="text-xs text-gray-500">{project.milestones?.length || 0} milestones</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestone Progress */}
        <div className="md:col-span-2">
          {selectedProject ? (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{selectedProject.title} - Milestones</h2>
                <button 
                  onClick={handleAddUpdate}
                  className="bg-purple-600 text-white px-3 py-1 text-sm rounded"
                >
                  Add Update
                </button>
              </div>
              
              {/* Milestone Progress */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-3">Milestone Progress</h3>
                {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {selectedProject.milestones.map(milestone => (
                      <div key={milestone._id} className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <span className="text-sm text-gray-500">Due: {new Date(milestone.deadline).toLocaleDateString()}</span>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        )}
                        <div className="mt-2 flex justify-between items-center">
                          <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${milestone.status === 'completed' ? 'bg-green-500' : milestone.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}`}
                              style={{ width: milestone.status === 'completed' ? '100%' : milestone.status === 'in_progress' ? '50%' : '0%' }}
                            ></div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${milestone.status === 'completed' ? 'bg-green-100 text-green-800' : milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {milestone.status === 'in_progress' ? 'In Progress' : milestone.status}
                          </span>
                        </div>
                        
                        {/* Add blockchain information */}
                        {milestone.useBlockchain && (
                          <div className="mt-2 border-t pt-2">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-medium text-purple-600">Blockchain Protected</span>
                            </div>
                            {milestone.blockchainId && (
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {milestone.blockchainId.substring(0, 6)}...{milestone.blockchainId.substring(milestone.blockchainId.length - 4)}
                              </div>
                            )}
                            {milestone.transactionHash && (
                              <div className="text-xs text-gray-500 mt-1">
                                <a 
                                  href={`https://mumbai.polygonscan.com/tx/${milestone.transactionHash}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  View Transaction
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No milestones found for this project.
                  </div>
                )}
              </div>
              
              {/* Feedback and Updates */}
              <div>
                <h3 className="text-md font-medium mb-3">Project Communication</h3>
                {loadingFeedback ? (
                  <div className="text-center py-4">Loading communication history...</div>
                ) : feedback.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                    {feedback.map(item => (
                      <div key={item._id} className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{item.userId.name}</h4>
                          <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm mt-1">{('comment' in item) ? item.comment : item.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 mb-4">
                    No communication history yet. Add an update to get started.
                  </div>
                )}
                
                {/* Add Update Form */}
                <div className="mt-4">
                  <textarea 
                    className="w-full border rounded p-2 text-sm" 
                    rows={3} 
                    placeholder="Add your update or feedback..."
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                  ></textarea>
                  <button 
                    className="mt-2 bg-purple-600 text-white px-4 py-2 rounded text-sm"
                    onClick={handleAddUpdate}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Select a project to view its progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 bg-purple-100 rounded-lg p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-purple-800">Ready to transform your project?</h2>
          <p className="text-purple-600 mt-1">Connect with top freelancers who can help you achieve your goals faster.</p>
        </div>
        <button 
          onClick={() => router.push('/client/find-freelancers')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Find Freelancers
        </button>
      </div>
    </div>
  );
}