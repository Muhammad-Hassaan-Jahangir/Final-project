'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

// Define types for our invitations
type InvitationStatus = 'pending' | 'accepted' | 'rejected';

type Invitation = {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    category: string;
    skills: string[];
    image?: string;
  };
  clientId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  freelancerId: string;
  status: InvitationStatus;
  message?: string;
  createdAt: string;
};

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<InvitationStatus | 'all'>('all');
  const router = useRouter();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/freelancer/invitations');
      setInvitations(response.data.invitations);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Failed to load invitations');
      setLoading(false);
    }
  };

  const handleInvitationAction = async (id: string, action: 'accept' | 'reject') => {
    try {
      await axios.put('/api/freelancer/invitations', {
        invitationId: id,
        status: action === 'accept' ? 'accepted' : 'rejected'
      });
      
      // Update local state
      setInvitations(prevInvitations =>
        prevInvitations.map(invitation =>
          invitation._id === id 
            ? { ...invitation, status: action === 'accept' ? 'accepted' : 'rejected' } 
            : invitation
        )
      );
      
      toast.success(`Invitation ${action === 'accept' ? 'accepted' : 'rejected'} successfully`);
      
      // If accepted, redirect to the job details page
      if (action === 'accept') {
        const invitation = invitations.find(inv => inv._id === id);
        if (invitation && invitation.jobId && invitation.jobId._id) {
          router.push(`/freelancer/view-jobs/${invitation.jobId._id}`);
        } else if (invitation) {
          toast.warning('Job details are no longer available');
        }
      }
    } catch (err) {
      console.error(`Error ${action}ing invitation:`, err);
      toast.error(`Failed to ${action} invitation`);
    }
  };

  const filteredInvitations = activeTab === 'all' 
    ? invitations 
    : invitations.filter(invitation => invitation.status === activeTab);

  const getStatusBadgeClass = (status: InvitationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Job Invitations</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('accepted')}
          className={`px-4 py-2 font-medium ${activeTab === 'accepted' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Accepted
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 font-medium ${activeTab === 'rejected' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : filteredInvitations.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">No {activeTab === 'all' ? '' : activeTab} invitations found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredInvitations.map((invitation) => (
            <div key={invitation._id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{invitation.jobId?.title || 'Job no longer available'}</h2>
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 mr-3">
                      {invitation.clientId?.profileImage ? (
                        <img 
                          src={invitation.clientId.profileImage} 
                          alt={invitation.clientId.name || 'Client'} 
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {invitation.clientId?.name?.charAt(0) || 'C'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{invitation.clientId?.name || 'Client'}</p>
                      <p className="text-sm text-gray-500">{invitation.clientId?.email || 'No email available'}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(invitation.status)}`}>
                  {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                </span>
              </div>
              
              <div className="mt-2 mb-4">
                <p className="text-gray-600 line-clamp-2">{invitation.jobId?.description || 'No description available'}</p>
              </div>
              
              {invitation.message && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Message: </span>
                    {invitation.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {invitation.jobId?.skills?.map((skill, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                    {skill}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <span className="ml-2 font-medium">${invitation.jobId?.budget || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Deadline:</span>
                  <span className="ml-2 font-medium">
                    {invitation.jobId?.deadline ? new Date(invitation.jobId.deadline).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium">{invitation.jobId?.category || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Invited on:</span>
                  <span className="ml-2 font-medium">
                    {invitation.createdAt ? new Date(invitation.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              
              {invitation.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleInvitationAction(invitation._id, 'accept')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Accept Invitation
                  </button>
                  <button
                    onClick={() => handleInvitationAction(invitation._id, 'reject')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
              
              {invitation.status === 'accepted' && invitation.jobId && (
                <button
                  onClick={() => router.push(`/freelancer/view-jobs/${invitation.jobId._id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors mt-4"
                >
                  View Job
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}