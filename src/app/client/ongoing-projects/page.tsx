"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
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
  assignedTo: {
    _id: string;
    name: string;
    profileImage?: string;
    email: string;
  };
}

export default function OngoingProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingProject, setConfirmingProject] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchOngoingProjects();
  }, []);

  const fetchOngoingProjects = async () => {
    try {
      const res = await axios.get('/api/client/dashboard');
      const allProjects = res.data.recentData.recentProjects;
      
      // Filter for in-progress and completed projects
      const ongoingProjects = allProjects.filter((project: Project) => 
        project.status === 'in_progress' || project.status === 'completed'
      );
      
      setProjects(ongoingProjects);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCompletion = async (projectId: string, confirmed: boolean) => {
    try {
      await axios.put(`/api/client/confirm-completion/${projectId}`, {
        confirmed,
        feedback
      });
      
      // Refresh projects
      await fetchOngoingProjects();
      setConfirmingProject(null);
      setFeedback('');
      
      alert(confirmed ? 'Project confirmed successfully!' : 'Feedback submitted');
    } catch (err) {
      alert('Failed to process confirmation');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">In Progress</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Completed</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">{status}</span>;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ongoing Projects</h1>
        <button
          onClick={() => router.push('/client/dashboard')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No ongoing projects found.</p>
          <Link href="/client/post-job">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
              Post a New Job
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white border rounded-lg p-6 shadow-sm">
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
                  {getStatusBadge(project.status)}
                </div>
              </div>

              {/* Freelancer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium mb-2">Assigned Freelancer</h3>
                <div className="flex items-center gap-3">
                  {project.assignedTo.profileImage && (
                    <img
                      src={project.assignedTo.profileImage}
                      alt={project.assignedTo.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{project.assignedTo.name}</p>
                    <p className="text-sm text-gray-600">{project.assignedTo.email}</p>
                  </div>
                  <Link href={`/chat/${project.assignedTo._id}`}>
                    <button className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                      Chat
                    </button>
                  </Link>
                </div>
              </div>

              {/* Submission Details (if completed) */}
              {project.status === 'completed' && (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-2 text-green-800">Work Submitted</h3>
                  {project.completedAt && (
                    <p className="text-sm text-gray-600 mb-2">
                      Completed on: {new Date(project.completedAt).toLocaleDateString()}
                    </p>
                  )}
                  {project.submissionFile && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">Submission:</p>
                      <p className="text-sm text-blue-600">{project.submissionFile}</p>
                    </div>
                  )}
                  {project.completionNotes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium">Notes:</p>
                      <p className="text-sm text-gray-700">{project.completionNotes}</p>
                    </div>
                  )}
                  
                  {!project.clientConfirmed ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmingProject(project._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Confirm Completion
                      </button>
                      <button
                        onClick={() => handleConfirmCompletion(project._id, false)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Request Revision
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-medium">✓ Confirmed by you</span>
                      <Link href={`/client/review/${project._id}`}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                          Leave Review
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Project Completion</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Feedback (Optional)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Any feedback for the freelancer..."
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirmCompletion(confirmingProject, true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Confirm & Complete
              </button>
              
              <button
                onClick={() => {
                  setConfirmingProject(null);
                  setFeedback('');
                }}
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