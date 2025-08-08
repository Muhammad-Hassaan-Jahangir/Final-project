'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';

// No need for chart components or client-only wrapper


// Define types for our statistics data
type JobStats = {
  completed: number;
  active: number;
  reviews: number;
};

type MonthlyEarnings = {
  month: string;
  amount: number;
};

type JobCategory = {
  category: string;
  count: number;
};

type ClientInteraction = {
  clientName: string;
  projectCount: number;
  totalEarnings: number;
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<JobStats | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [clientInteractions, setClientInteractions] = useState<ClientInteraction[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [acceptedBids, setAcceptedBids] = useState(0);
  const [pendingBids, setPendingBids] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchStatistics();
    // Set the date only on the client side
    setCurrentDate(new Date().toLocaleDateString('en-US'));
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Initialize default values
      let statsData = { completed: 0, active: 0, reviews: 0, totalEarnings: 0 };
      let reviewsData = { reviews: [], averageRating: 0, totalReviews: 0 };
      
      try {
        // Fetch basic stats
        const statsRes = await axios.get('/api/freelancer/stats');
        statsData = statsRes.data;
        setStats(statsData);
        setTotalEarnings(statsData.totalEarnings || 0);
      } catch (statsErr) {
        console.error('Error fetching basic stats:', statsErr);
        // Continue with default values
      }
      
      try {
        // Fetch dashboard data for additional information
        const dashboardRes = await axios.get('/api/freelancer/dashboard');
        // Extract bid data from dashboard
        if (dashboardRes.data && dashboardRes.data.stats) {
          // Get pending bids count
          setPendingBids(dashboardRes.data.stats.pendingBids || 0);
          
          // Get accepted bids count by counting active and completed projects
          // since each accepted bid becomes a project
          const acceptedBidsCount = 
            (dashboardRes.data.stats.activeProjects || 0) + 
            (dashboardRes.data.stats.completedProjects || 0);
          setAcceptedBids(acceptedBidsCount);
        }
      } catch (dashboardErr) {
        console.error('Error fetching dashboard data:', dashboardErr);
        // Continue with available data
      }
      
      try {
        // Fetch user profile to get user ID
        const profileRes = await axios.get('/api/freelancer/profile');
        const userId = profileRes.data._id;
        
        // Fetch reviews data using the user ID
        if (userId) {
          const reviewsRes = await axios.get(`/api/reviews?userId=${userId}&type=received`);
          reviewsData = reviewsRes.data;
          
          // Set the average rating and total reviews states
          setAverageRating(reviewsData.averageRating || 0);
          setTotalReviews(reviewsData.totalReviews || 0);
        }
      } catch (reviewsErr) {
        console.error('Error fetching reviews data:', reviewsErr);
        // Continue with default values
      }
      
      try {
        // Get completed projects to generate monthly earnings data
        const projectsRes = await axios.get('/api/freelancer/projects?type=assigned');
        if (projectsRes.data && projectsRes.data.projects) {
          const filteredProjects = projectsRes.data.projects.filter(
            (project: any) => project.status === 'completed'
          );
          
          // Set the completed projects state
          setCompletedProjects(filteredProjects);
          
          // Process the data
          processMonthlyEarnings(filteredProjects);
          processJobCategories(filteredProjects);
          processClientInteractions(filteredProjects);
        }
      } catch (projectsErr) {
        console.error('Error fetching projects data:', projectsErr);
        // Initialize with empty data
        processMonthlyEarnings([]);
        processJobCategories([]);
        processClientInteractions([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchStatistics:', err);
      setError('Failed to load statistics');
      setLoading(false);
    }
  };

  const processMonthlyEarnings = (completedProjects: any[]) => {
    // Initialize earnings for all months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: { [key: string]: number } = {};
    
    months.forEach(month => {
      monthlyData[month] = 0;
    });
    
    // Process completed projects to get monthly earnings
    completedProjects.forEach(project => {
      if (project.completedAt) {
        const completionDate = new Date(project.completedAt);
        const month = months[completionDate.getMonth()];
        
        // Use project budget or calculate from basicBudget and expertBudget
        const projectBudget = project.budget || 
          ((project.basicBudget && project.expertBudget) ? 
            (project.basicBudget + project.expertBudget) / 2 : 
            (project.basicBudget || project.expertBudget || 0));
        
        monthlyData[month] += projectBudget;
      }
    });
    
    // Convert to array format for the state
    const monthlyEarningsData = months.map(month => ({
      month,
      amount: monthlyData[month]
    }));
    
    setMonthlyEarnings(monthlyEarningsData);
  };
  
  const processJobCategories = (completedProjects: any[]) => {
    // Count projects by category
    const categoryCounts: { [key: string]: number } = {};
    
    completedProjects.forEach(project => {
      const category = project.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Convert to array format for the state
    const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    }));
    
    // Sort by count in descending order
    categoryData.sort((a, b) => b.count - a.count);
    
    setJobCategories(categoryData);
  };
  
  const processClientInteractions = (completedProjects: any[]) => {
    // Group projects by client
    const clientData: { [key: string]: { projectCount: number, totalEarnings: number } } = {};
    
    completedProjects.forEach(project => {
      if (project.userId && project.userId.name) {
        const clientName = project.userId.name;
        
        if (!clientData[clientName]) {
          clientData[clientName] = { projectCount: 0, totalEarnings: 0 };
        }
        
        // Use project budget or calculate from basicBudget and expertBudget
        const projectBudget = project.budget || 
          ((project.basicBudget && project.expertBudget) ? 
            (project.basicBudget + project.expertBudget) / 2 : 
            (project.basicBudget || project.expertBudget || 0));
        
        clientData[clientName].projectCount += 1;
        clientData[clientName].totalEarnings += projectBudget;
      }
    });
    
    // Convert to array format for the state
    const clientInteractionsData = Object.entries(clientData).map(([clientName, data]) => ({
      clientName,
      projectCount: data.projectCount,
      totalEarnings: data.totalEarnings
    }));
    
    // Sort by total earnings in descending order
    clientInteractionsData.sort((a, b) => b.totalEarnings - a.totalEarnings);
    
    setClientInteractions(clientInteractionsData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1 1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Statistics
          </h1>
          <div className="text-sm text-gray-500">
            {currentDate && `Last updated: ${currentDate}`}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
                    <p className="text-3xl font-bold text-gray-800">{stats?.completed || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Successfully delivered projects</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                    <p className="text-3xl font-bold text-gray-800">{stats?.active || 0}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Currently in progress</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client Reviews</p>
                    <p className="text-3xl font-bold text-gray-800">{stats?.reviews || 0}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Feedback from clients</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                    <p className="text-3xl font-bold text-gray-800">{formatCurrency(totalEarnings)}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Revenue from all projects</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Earnings Table */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Earnings</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Earnings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {monthlyEarnings.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatCurrency(monthlyEarnings.reduce((sum, item) => sum + item.amount, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Job Categories List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Job Categories</h2>
                <div className="space-y-4">
                  {jobCategories.map((category, index) => {
                    // Calculate percentage of total jobs
                    const totalJobs = jobCategories.reduce((sum, cat) => sum + cat.count, 0);
                    const percentage = Math.round((category.count / totalJobs) * 100);
                    const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500", "bg-purple-500"];
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{category.category}</span>
                          <span className="text-sm font-medium text-gray-900">{category.count} jobs ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`${colors[index % colors.length]} h-2.5 rounded-full`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Client Interactions Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Client Interactions</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projects
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Earnings
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average per Project
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientInteractions.map((client, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 font-medium">{client.clientName.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.projectCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(client.totalEarnings)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(client.totalEarnings / client.projectCount)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Project Duration</h3>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    {/* Calculate average days to complete projects */}
                    <p className="text-3xl font-bold text-gray-800">
                      {completedProjects && completedProjects.length > 0 ? (
                        completedProjects.filter(project => project.completedAt && project.createdAt).length > 0 ? (
                          Math.round(
                            completedProjects
                              .filter(project => project.completedAt && project.createdAt)
                              .reduce((sum, project) => {
                                const start = new Date(project.createdAt);
                                const end = new Date(project.completedAt);
                                const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                return sum + days;
                              }, 0) / 
                            completedProjects.filter(project => project.completedAt && project.createdAt).length
                          ) + ' days'
                        ) : '0 days'
                      ) : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Average time to complete a project</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bid Success Rate</h3>
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    {/* Calculate bid success rate */}
                    <p className="text-3xl font-bold text-gray-800">
                      {(() => {
                        try {
                          // Calculate total bids (accepted + pending)
                          const totalBids = acceptedBids + pendingBids;
                          
                          // Calculate success rate
                          const successRate = totalBids > 0 ? Math.round((acceptedBids / totalBids) * 100) : 0;
                          return `${successRate}%`;
                        } catch (err) {
                          console.error('Error calculating bid success rate:', err);
                          return 'N/A';
                        }
                      })()}
                    </p>
                    <p className="text-sm text-gray-500">Percentage of successful bids</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Satisfaction</h3>
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    {/* Display average rating */}
                    <p className="text-3xl font-bold text-gray-800">
                      {totalReviews > 0 ? `${averageRating.toFixed(1)}/5` : '0.0/5'}
                    </p>
                    <p className="text-sm text-gray-500">Average client rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips for Improvement */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tips for Improvement</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold text-gray-800">Diversify Your Skills</h3>
                  </div>
                  <p className="text-gray-600">Consider learning new technologies to expand your service offerings and attract more clients.</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold text-gray-800">Optimize Your Pricing</h3>
                  </div>
                  <p className="text-gray-600">Based on your completion time and client feedback, you might consider adjusting your rates.</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold text-gray-800">Enhance Your Portfolio</h3>
                  </div>
                  <p className="text-gray-600">Add more detailed case studies to your portfolio to showcase your expertise and process.</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-semibold text-gray-800">Improve Response Time</h3>
                  </div>
                  <p className="text-gray-600">Faster responses to client inquiries can increase your chances of winning projects.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}