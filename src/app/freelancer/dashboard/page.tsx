'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FreelancerProfile = {
    name: string;
    email: string;
    role: string;
    bio: string;
    skills: string[];
    hourlyRate: number;
    profileImage: string;
    portfolio: Array<{
        title: string;
        description: string;
        completedDate: string;
        imageUrl: string;
    }>;
};

type JobStats = {
    completed: number;
    active: number;
    reviews: number;
    totalEarnings?: number;
    availableJobs?: number;
};

type Notification = {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: string;
    relatedId?: string;
};

type Project = {
    _id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    status: string;
    userId: {
        _id: string;
        name: string;
        profileImage?: string;
    };
};

// Add a new type for reviews
type Review = {
  _id: string;
  projectId: {
    _id: string;
    title: string;
  };
  reviewerId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  reviewType: string;
};

export default function Freelancer() {
    const [profile, setProfile] = useState<FreelancerProfile | null>(null);
    const [stats, setStats] = useState<JobStats | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState<Review[]>([]); // State for reviews
    const [averageRating, setAverageRating] = useState<number>(0); // State for average rating
    const router = useRouter();
    
    // Define renderClientReviews variable
    const renderClientReviews = (
        <div>
            {averageRating > 0 && (
                <div className="ml-auto flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="ml-1 text-sm font-medium text-yellow-700">{averageRating.toFixed(1)}</span>
                    <span className="ml-1 text-xs text-gray-500">({reviews.length} reviews)</span>
                </div>
            )}
            <div className="bg-white border rounded-lg shadow p-3 sm:p-4">
                <div className="space-y-4 max-h-80 overflow-y-auto">
                    {reviews.length === 0 ? (
                        <div className="text-gray-500 text-center py-6 flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <p>No reviews yet</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                        <img 
                                            src={review.reviewerId.profileImage || '/profile-placeholder.jpg'} 
                                            alt={review.reviewerId.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{review.reviewerId.name}</h4>
                                                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="mt-2 text-gray-700 bg-gray-50 p-3 rounded-lg">{review.comment}</p>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Project: {review.projectId.title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {reviews.length > 0 && (
                    <div className="text-center mt-4">
                        <button 
                            onClick={() => router.push('/freelancer/reviews')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            View all reviews
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    useEffect(() => {
        const fetchFreelancerData = async () => {
            try {
                // Send API requests with the cookies included automatically
                const profileRes = await axios.get('/api/freelancer/profile', {
                    withCredentials: true  // Include cookies (including the token)
                });
                setProfile(profileRes.data);

                const statsRes = await axios.get('/api/freelancer/stats', {
                    withCredentials: true
                });
                setStats(statsRes.data);

                // Fetch notifications
                const notificationsRes = await axios.get('/api/notifications', {
                    withCredentials: true
                });
                setNotifications(notificationsRes.data.notifications || []);
                
                // Fetch recent projects/jobs
                const projectsRes = await axios.get('/api/freelancer/accepted-jobs', {
                    withCredentials: true
                });
                setRecentProjects(projectsRes.data.jobs || []);
                
                // Fetch reviews from dashboard API
                const dashboardRes = await axios.get('/api/freelancer/dashboard', {
                    withCredentials: true
                });
                
                if (dashboardRes.data.recentData && dashboardRes.data.recentData.recentReviews) {
                    setReviews(dashboardRes.data.recentData.recentReviews || []);
                    setAverageRating(dashboardRes.data.stats.averageRating || 0);
                }
            } catch (err) {
                setError('Failed to load freelancer data');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFreelancerData();
    }, [router]);

    const markAsRead = async (notificationId: string) => {
        try {
            await axios.put('/api/notifications', { notificationId }, {
                withCredentials: true
            });
            setNotifications(prev => 
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        await markAsRead(notification._id);
        
        // Handle navigation based on notification type
        switch (notification.type) {
            case 'bid_accepted':
                router.push('/freelancer/accepted-jobs');
                break;
            case 'bid_rejected':
                // Stay on dashboard to see all projects/bids
                break;
            case 'project_confirmed':
                router.push('/freelancer/accepted-jobs');
                break;
            case 'revision_requested':
                router.push('/freelancer/ongoing-projects');
                break;
            case 'project_completed':
                router.push('/freelancer/ongoing-projects');
                break;
            default:
                break;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_progress':
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">In Progress</span>;
            case 'completed':
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Completed</span>;
            case 'pending':
                return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">Pending</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">{status}</span>;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                <h1 className="text-2xl font-bold">Freelancer Dashboard</h1>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:space-x-3">
                    <button 
                        onClick={() => router.push('/freelancer/view-jobs')}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors duration-200 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                        </svg>
                        Find Jobs
                    </button>
                    <button 
                        onClick={() => router.push('/freelancer/ongoing-projects')}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors duration-200 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Ongoing Projects
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-8">
                {/* Profile Section */}
                <div className="flex flex-col items-center md:w-1/4">
                    <div className="relative w-24 h-24 mb-2">
                        <img 
                            src={profile?.profileImage || '/profile-placeholder.jpg'} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover border-2 border-blue-100"
                        />
                    </div>
                    <div className="text-lg font-bold mt-2">{profile?.name || 'Loading...'}</div>
                    <p className="text-gray-600">{profile?.role || 'Freelance Developer'}</p>
                    <p className="text-green-600 font-semibold mt-1">${profile?.hourlyRate || 0}/hr</p>
                    
                    {/* Star Rating Display - Clickable */}
                    {averageRating > 0 && (
                        <div 
                            className="flex items-center bg-yellow-50 px-3 py-1 rounded-full mt-2 cursor-pointer hover:bg-yellow-100 transition-colors duration-200"
                            onClick={() => router.push('/freelancer/reviews')}
                            title="Click to view all reviews"
                        >
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="ml-1 text-sm font-medium text-yellow-700">{averageRating.toFixed(1)}</span>
                            <span className="ml-1 text-xs text-gray-500">({reviews.length} reviews)</span>
                        </div>
                    )}
                    
                    {/* Bio Section */}
                    <div className="mt-6 w-full">
                        <h3 className="text-lg font-semibold mb-2">About Me</h3>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-gray-700">{profile?.bio || 'No bio available'}</p>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="mt-6 w-full">
                        <h3 className="text-lg font-semibold mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile?.skills?.length ? profile?.skills?.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                    {skill}
                                </span>
                            )) : <p className="text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 w-full">No skills listed</p>}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                        <div className="bg-blue-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="text-xs text-gray-600 mb-1 font-medium">Completed Jobs</div>
                            <div className="text-2xl font-bold">{stats?.completed || 0}</div>
                            <div className="mt-1 text-xs text-blue-600">Successfully delivered</div>
                        </div>
                        <div className="bg-green-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="text-xs text-gray-600 mb-1 font-medium">Active Jobs</div>
                            <div className="text-2xl font-bold">{stats?.active || 0}</div>
                            <div className="mt-1 text-xs text-green-600">In progress</div>
                        </div>
                        <div className="bg-yellow-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="text-xs text-gray-600 mb-1 font-medium">Client Reviews</div>
                            <div className="text-2xl font-bold">{stats?.reviews || 0}</div>
                            <div className="mt-1 text-xs text-yellow-600">From clients</div>
                        </div>
                        <div className="bg-purple-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="text-xs text-gray-600 mb-1 font-medium">Total Earnings</div>
                            <div className="text-2xl font-bold">${stats?.totalEarnings || 0}</div>
                            <div className="mt-1 text-xs text-purple-600">Lifetime earnings</div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                            <h3 className="text-xl font-bold flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                                Recent Notifications
                            </h3>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium mt-1 sm:mt-0">
                                {notifications.filter(n => !n.isRead).length} unread
                            </span>
                        </div>
                        <div className="bg-white border rounded-lg shadow p-3 sm:p-4">
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="text-gray-500 text-center py-6 flex flex-col items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                        </svg>
                                        <p>No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className={`font-medium ${
                                                            notification.isRead ? 'text-gray-900' : 'text-blue-900'
                                                        }`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.isRead && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm mt-1 ${
                                                        notification.isRead ? 'text-gray-600' : 'text-blue-800'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-xs text-gray-400">
                                                            {formatDate(notification.createdAt)}
                                                        </p>
                                                        {!notification.isRead && (
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">New</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {notifications.length > 5 && (
                                <div className="text-center mt-4">
                                    <button 
                                        onClick={() => router.push('/freelancer/notifications')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors duration-200"
                                    >
                                        View all notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Projects Section */}
                    <div>
                        <div className="flex items-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-xl font-bold">Recent Projects</h3>
                        </div>
                        <div className="bg-white border rounded-lg shadow p-3 sm:p-4">
                            <div className="space-y-4 max-h-80 overflow-y-auto">
                                {recentProjects.length === 0 ? (
                                    <div className="text-gray-500 text-center py-6 flex flex-col items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <p>No projects yet</p>
                                    </div>
                                ) : (
                                    recentProjects.map((project) => (
                                        <div key={project._id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                                <h4 className="font-medium text-lg">{project.title}</h4>
                                                {getStatusBadge(project.status)}
                                            </div>
                                            <p className="text-gray-600 text-sm mt-2 bg-gray-50 p-2 rounded">{project.description.substring(0, 100)}...</p>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-3">
                                                <div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 w-full sm:w-auto">
                                                    <p className="text-gray-600 flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="font-medium">Budget:</span> ${project.budget}
                                                    </p>
                                                    <p className="text-gray-600 flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="font-medium">Deadline:</span> {new Date(project.deadline).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {recentProjects.length > 0 && (
                                <div className="text-center mt-4">
                                    <button 
                                        onClick={() => router.push('/freelancer/projects')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors duration-200"
                                    >
                                        View All Projects
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
)




  // Main component return statement
  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h1 className="text-2xl font-bold">Freelancer Dashboard</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:space-x-3">
          <button 
            onClick={() => router.push('/freelancer/view-jobs')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
            Find Jobs
          </button>
          <button 
            onClick={() => router.push('/freelancer/ongoing-projects')}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Ongoing Projects
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-8">
        {/* Profile Section */}
        <div className="flex flex-col items-center md:w-1/4">
          <div className="relative w-24 h-24 mb-2">
            <img 
              src={profile?.profileImage || '/profile-placeholder.jpg'} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border-2 border-blue-100"
            />
          </div>
          <div className="text-lg font-bold mt-2">{profile?.name || 'Loading...'}</div>
          <p className="text-gray-600">{profile?.role || 'Freelance Developer'}</p>
          <p className="text-green-600 font-semibold mt-1">${profile?.hourlyRate || 0}/hr</p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button 
                  onClick={() => router.push('/freelancer/edit-profile')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-200 flex items-center"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
              </button>
              <button 
                  onClick={() => router.push('/chat')}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors duration-200 flex items-center"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  Chat
              </button>
          </div>

          {/* Bio Section */}
          <div className="mt-6 w-full">
              <h3 className="text-lg font-semibold mb-2">About Me</h3>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-700">{profile?.bio || 'No bio available'}</p>
              </div>
          </div>

          {/* Skills Section */}
          <div className="mt-6 w-full">
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                  {profile?.skills?.length ? profile?.skills?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                          {skill}
                      </span>
                  )) : <p className="text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 w-full">No skills listed</p>}
              </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-blue-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-xs text-gray-600 mb-1 font-medium">Completed Jobs</div>
              <div className="text-2xl font-bold">{stats?.completed || 0}</div>
              <div className="mt-1 text-xs text-blue-600">Successfully delivered</div>
            </div>
            <div className="bg-green-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-xs text-gray-600 mb-1 font-medium">Active Jobs</div>
              <div className="text-2xl font-bold">{stats?.active || 0}</div>
              <div className="mt-1 text-xs text-green-600">In progress</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-xs text-gray-600 mb-1 font-medium">Client Reviews</div>
              <div className="text-2xl font-bold">{stats?.reviews || 0}</div>
              <div className="mt-1 text-xs text-yellow-600">From clients</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-xs text-gray-600 mb-1 font-medium">Total Earnings</div>
              <div className="text-2xl font-bold">${stats?.totalEarnings || 0}</div>
              <div className="mt-1 text-xs text-purple-600">Lifetime earnings</div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
              <h3 className="text-xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Recent Notifications
              </h3>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium mt-1 sm:mt-0">
                {notifications.filter(n => !n.isRead).length} unread
              </span>
            </div>
            <div className="bg-white border rounded-lg shadow p-3 sm:p-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-gray-500 text-center py-6 flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${
                              notification.isRead ? 'text-gray-900' : 'text-blue-900'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            notification.isRead ? 'text-gray-600' : 'text-blue-800'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-400">
                              {formatDate(notification.createdAt)}
                            </p>
                            {!notification.isRead && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">New</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 5 && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => router.push('/freelancer/notifications')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
