'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import BidAcceptPayment from '@/components/BidAcceptPayment';

type Bid = {
  _id: string;
  amount: number;
  coverLetter: string;
  status: string;
  createdAt: string;
  freelancerId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    bio?: string;
    phone?: string;
    skills?: string[];
    hourlyRate?: number;
    location?: string;
    experience?: string;
    portfolio?: any[];
    walletAddress?: string; // Added missing property
  };
};

export default function JobBidsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingBid, setProcessingBid] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [milestoneId, setMilestoneId] = useState<string>('');
  
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await axios.get(`/api/client/view-jobs/${id}/bids`, {
          withCredentials: true,
        });
        console.log('Fetched bids:', res.data.bids);
        setBids(res.data.bids || []);
        setTitle(res.data.title || '');
      } catch (err) {
        console.error('Failed to load bids:', err);
        setError('Failed to load bids');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [id]);
  
  const handleStatusChange = async (bidId: string, action: 'accept' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this bid?`)) {
      return;
    }
  
    setProcessingBid(bidId);
    try {
      const res = await axios.put(
        `/api/client/bids/${bidId}/${action}`,
        {},
        { withCredentials: true }
      );
      
      // Update the status in the UI
      setBids((prev) =>
        prev.map((bid) =>
          bid._id === bidId ? { ...bid, status: action === 'accept' ? 'accepted' : 'rejected' } : bid
        )
      );
      
      // Inside handleStatusChange function, after the bid is accepted
      if (action === 'accept' && res.data.requiresPayment) {
        const acceptedBid = bids.find(bid => bid._id === bidId);
        if (acceptedBid) {
          // Check if freelancer has a wallet address
          if (!acceptedBid.freelancerId.walletAddress || acceptedBid.freelancerId.walletAddress.trim() === '') {
            alert('This freelancer has not connected their wallet yet. Please ask them to set up their wallet before proceeding with payment.');
            return;
          }
          
          setSelectedBid(acceptedBid);
          setMilestoneId(res.data.milestone);
          setShowPayment(true);
        }
      } else {
        // Show success message
        alert(`Bid ${action}ed successfully!`);
      }
    } catch (err) {
      console.error(`Failed to ${action} bid:`, err);
      alert(`Failed to ${action} bid. Please try again.`);
    } finally {
      setProcessingBid(null);
    }
  };
  
  const handlePaymentComplete = (result: any) => {
    alert('Payment successfully created in escrow! The freelancer can now begin work.');
    setShowPayment(false);
  };
  
  const handlePaymentError = (error: any) => {
    alert(`Payment error: ${error.message || error}`);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
              >
                ← Back to Jobs
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Bids for: <span className="text-blue-600">{title || 'Job'}</span>
              </h1>
              <p className="text-gray-600 mt-1">{bids.length} bid(s) received</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && bids.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bids yet</h3>
            <p className="text-gray-600">No freelancers have submitted bids for this job yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bids.map((bid) => (
              <div key={bid._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Bid Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={bid.freelancerId?.profileImage || '/default-avatar.png'}
                        alt={bid.freelancerId?.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {bid.freelancerId?.name}
                        </h2>
                        <p className="text-gray-600">{bid.freelancerId?.email}</p>
                        {bid.freelancerId?.location && (
                          <p className="text-sm text-gray-500">📍 {bid.freelancerId.location}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${bid.amount}</div>
                      {bid.freelancerId?.hourlyRate && (
                        <p className="text-sm text-gray-500">Hourly Rate: ${bid.freelancerId.hourlyRate}/hr</p>
                      )}
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(bid.status)}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bid Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Cover Letter */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">
                            {bid.coverLetter || 'No cover letter provided.'}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      {bid.freelancerId?.skills && bid.freelancerId.skills.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {bid.freelancerId.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Freelancer Bio */}
                      {bid.freelancerId?.bio && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                          <p className="text-gray-700 leading-relaxed">{bid.freelancerId.bio}</p>
                        </div>
                      )}

                      {/* Experience */}
                      {bid.freelancerId?.experience && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                          <p className="text-gray-700">{bid.freelancerId.experience}</p>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>📧 {bid.freelancerId?.email}</p>
                          {bid.freelancerId?.phone && (
                            <p>📞 {bid.freelancerId.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Bid Date */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Bid Submitted</h3>
                        <p className="text-gray-600">
                          {new Date(bid.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {bid.status === 'pending' && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => handleStatusChange(bid._id, 'accept')}
                          disabled={processingBid === bid._id}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                        >
                          {processingBid === bid._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            '✓'
                          )}
                          Accept Bid
                        </button>
                        <button
                          onClick={() => handleStatusChange(bid._id, 'reject')}
                          disabled={processingBid === bid._id}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                        >
                          {processingBid === bid._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            '✗'
                          )}
                          Reject Bid
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status Message for Non-Pending Bids */}
                  {bid.status !== 'pending' && (
                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                      <p className="text-gray-600">
                        This bid has been <span className="font-semibold capitalize">{bid.status}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Payment Modal - Moved inside the return statement */}
        {showPayment && selectedBid && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create Escrow Payment</h2>
              <BidAcceptPayment
                freelancerAddress={selectedBid.freelancerId.walletAddress || ''}
                amount={selectedBid.amount}
                bidId={selectedBid._id}
                jobTitle={title}
                milestoneId={milestoneId}
                onPaymentComplete={handlePaymentComplete}
                onError={handlePaymentError}
              />
              <button
                onClick={() => setShowPayment(false)}
                className="mt-4 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
