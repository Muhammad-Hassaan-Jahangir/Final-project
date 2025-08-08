"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  image?: string;
  budget?: number;
}

interface Bid {
  _id: string;
  amount: number;
  coverLetter: string;
  status: string;
  createdAt: string;
  freelancerId: {
    _id: string;
    name: string;
    profileImage?: string;
    hourlyRate?: number;
    skills?: string[];
  };
  jobId: {
    _id: string;
    title: string;
    budget: number;
  };
}

interface Transaction {
  type: string;
  amount: number;
  date: string;
}

interface Stats {
  totalProjects: number;
  openProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBidsReceived: number;
  totalSpent: number;
  averageRating: number;
  totalReviews: number;
  unreadNotifications: number;
  projectsNeedingAttention: number;
  badges?: number;
  favoriteJobs?: any[];
  transactionHistory?: Transaction[];
  year?: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  phone?: string;
  profileImage?: string;
  badges?: number;
}

interface DashboardData {
  user: User;
  stats: Stats;
  recentData: {
    recentProjects: Project[];
    recentBids: Bid[];
    projectsNeedingAttention: Project[];
    recentReviews: any[];
  };
  projectBreakdown: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  recentProjects?: Project[]; // For backward compatibility
}

export default function ClientProfileDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", phone: "", profileImage: "" });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserIdAndData() {
      setLoading(true);
      // 1. Get the current user's ID
      const meRes = await axios.get("/api/auth/me");
      const id = meRes.data?.user?._id;
      setUserId(id);

      // 2. Fetch dashboard data
      if (id) {
        const res = await axios.get(`/api/client/dashboard`);
        setData(res.data);
        setForm({
          name: res.data.user.name || "",
          bio: res.data.user.bio || "",
          phone: res.data.user.phone || "",
          profileImage: res.data.user.profileImage || "",
        });
      }
      setLoading(false);
    }
    fetchUserIdAndData();
  }, []);

  const handleEdit = () => setEdit(true);
  const handleCancel = () => setEdit(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = async () => {
    await axios.patch(`/api/user/${userId}`, form);
    setEdit(false);
    // Refresh data
    const res = await axios.get(`/api/client/dashboard`);
    setData(res.data);
  };
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
      await axios.delete(`/api/user/${userId}`);
      await axios.get("/api/logout");
      router.push("/login");
    }
  };
  const handleNext = () => {
    // Placeholder for next step or navigation
    router.push('/client/post-job');
  };

  const handleChat = () => {
    router.push(`/chat/${userId}`);
  };

  const handleFindFreelancers = () => {
    router.push('/client/find-freelancers');
  };

  const handleProjectProgress = () => {
    router.push('/client/ongoing-projects');
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`/api/user/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, profileImage: res.data.url }));
    } catch (err) {
      alert('Failed to upload image');
    }
    setUploading(false);
  };

  if (loading || !data) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  const { user, stats, recentData, projectBreakdown } = data;
  const recentProjects = recentData?.recentProjects || data.recentProjects || [];
  const recentBids = recentData?.recentBids || [];
  const projectsNeedingAttention = recentData?.projectsNeedingAttention || [];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <h1 className="text-2xl font-bold">Client Dashboard</h1>
          <button
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors duration-200"
            onClick={() => router.push('/client/post-job')}
          >
            Post Job
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-8">
          {/* Profile Section */}
          <div className="flex flex-col items-center md:w-1/4">
            <div className="relative w-24 h-24 mb-2">
              <Image 
                src={user.profileImage || "/default-avatar.png"} 
                fill
                alt="avatar" 
                className="rounded-full object-cover border-2 border-blue-100" 
              />
            </div>
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-gray-500">Client Profile</div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              
              <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => router.push('/client/edit-profile')}>Edit Profile</button>
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded p-3 flex flex-col items-center">

              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">Active</span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">Verified</span>
              </div>
              <div className="mt-2 text-center">
                <div className="font-bold">{user.name}</div>
                <div className="text-xs text-gray-500">Member since 2023</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-4 sm:gap-6">
            {/* Project Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-blue-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-xs text-gray-600 mb-1 font-medium">Total Projects</div>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <div className="mt-1 text-xs text-blue-600">All time</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-xs text-gray-600 mb-1 font-medium">Active Projects</div>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                <div className="mt-1 text-xs text-green-600">In progress</div>
              </div>
              <div className="bg-yellow-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-xs text-gray-600 mb-1 font-medium">Total Bids Received</div>
                <div className="text-2xl font-bold">{stats.totalBidsReceived}</div>
                <div className="mt-1 text-xs text-yellow-600">From freelancers</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-xs text-gray-600 mb-1 font-medium">Total Spent</div>
                <div className="text-2xl font-bold">${stats.totalSpent.toFixed(3)}</div>
                <div className="mt-1 text-xs text-purple-600">On projects</div>
              </div>
            </div>

            {/* Recent Bids Received */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <div className="font-semibold">Recent Bids Received</div>
                <button 
                  onClick={() => router.push('/client/view-jobs')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All Jobs & Bids
                </button>
              </div>
              <div className="bg-white border rounded shadow p-4 space-y-4 overflow-hidden">
                {recentBids.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">No bids received yet.</div>
                ) : (
                  <div className="space-y-3">
                    {recentBids.map((bid) => (
                      <div key={bid._id} className="border-b border-gray-100 pb-3 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 rounded p-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <img 
                                src={bid.freelancerId.profileImage || '/default-avatar.png'} 
                                alt={bid.freelancerId.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <div className="font-medium text-sm">{bid.freelancerId.name}</div>
                                <div className="text-xs text-gray-500">
                                  Bid on: {bid.jobId.title}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-1 bg-gray-50 p-2 rounded border-l-2 border-blue-300">
                              {bid.coverLetter.substring(0, 100)}{bid.coverLetter.length > 100 ? '...' : ''}
                            </div>
                            <div className="text-xs text-gray-400">
                              {bid.createdAt ? (new Date(bid.createdAt) instanceof Date && !isNaN(new Date(bid.createdAt).getTime()) ? new Date(bid.createdAt).toLocaleDateString() : 'Invalid date') : 'No date'}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-bold text-green-600">${bid.amount}</div>
                            <div className="text-xs text-gray-500">
                              Budget: ${bid.jobId.budget}
                            </div>
                            <button
                              onClick={() => router.push(`/client/job-bids/${bid.jobId._id}`)}
                              className="mt-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                              View Bid
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Projects */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Recent Projects</div>
                <button 
                  onClick={() => router.push('/client/view-jobs')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All Projects
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {recentProjects.length === 0 ? (
                  <div className="col-span-full text-gray-500 text-center py-4">No projects yet. Click "Post Job" to get started.</div>
                ) : (
                  recentProjects.map((proj) => (
                    <div key={proj._id} className="bg-white border rounded shadow p-3 flex flex-col cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => handleProjectClick(proj._id)}>
                      <div className="relative h-32 w-full mb-2 bg-gray-100 rounded overflow-hidden">
                        {/* Project image with placeholder fallback */}
                        <div className="w-full h-full relative">
                          <img 
                            src={proj.image && proj.image !== '' 
                              ? proj.image 
                              : `/project-placeholders/${(parseInt(proj._id.toString().substring(0, 8), 16) % 5) + 1}.jpg`}
                            alt={proj.title} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <span className="text-xs text-white font-medium px-2 py-1 rounded-full bg-blue-500/80">
                            {proj.status === 'pending' ? 'Open' : 
                             proj.status === 'in_progress' ? 'In Progress' : 
                             proj.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-sm line-clamp-1">{proj.title}</div>
                      <div className="text-xs text-gray-500 mb-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {proj.deadline ? (new Date(proj.deadline) instanceof Date && !isNaN(new Date(proj.deadline).getTime()) ? new Date(proj.deadline).toLocaleDateString() : 'Invalid date') : 'No deadline'}
                      </div>
                      <div className="text-xs text-gray-700 line-clamp-2">{proj.description}</div>
                      <div className="mt-auto pt-2 flex justify-between items-center">
                        <span className="text-xs font-semibold">${proj.budget}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{proj.category || 'Uncategorized'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Projects Needing Attention */}
            {projectsNeedingAttention.length > 0 && (
              <div>
                <div className="font-semibold mb-2 text-orange-600">Projects Needing Attention</div>
                <div className="bg-orange-50 border border-orange-200 rounded shadow p-3 sm:p-4">
                  <div className="space-y-3">
                    {projectsNeedingAttention.map((project) => (
                      <div key={project._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 border-b border-orange-200 last:border-b-0">
                        <div>
                          <div className="font-semibold">{project.title}</div>
                          <div className="text-xs text-gray-600 mt-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {project.status}
                          </div>
                        </div>
                        <button
                          onClick={() => router.push('/client/projects-progress')}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm transition-colors duration-200 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div>
              <div className="font-semibold mb-2">Transaction History</div>
              <div className="bg-white border rounded shadow p-3 sm:p-4 overflow-x-auto">
                {!stats.transactionHistory || stats.transactionHistory.length === 0 ? (
                  <div className="text-gray-500">No transactions yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-1 text-sm font-medium text-gray-500">Type</th>
                          <th className="text-right py-2 px-1 text-sm font-medium text-gray-500">Amount</th>
                          <th className="text-right py-2 px-1 text-sm font-medium text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.transactionHistory.map((t, idx) => (
                          <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="py-2 px-1 capitalize">{t.type}</td>
                            <td className="py-2 px-1 text-right font-medium">${t.amount}</td>
                            <td className="py-2 px-1 text-right text-xs text-gray-500">{t.date ? (new Date(t.date) instanceof Date && !isNaN(new Date(t.date).getTime()) ? new Date(t.date).toLocaleDateString() : 'Invalid date') : 'No date'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:space-x-4">
              <button
                onClick={handleFindFreelancers}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex-1 transition-colors duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Find Freelancers
              </button>
              <button
                onClick={handleProjectProgress}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex-1 transition-colors duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Project Progress
              </button>
              <Link href="/chat" className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex-1 transition-colors duration-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Messages
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
