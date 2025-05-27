'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

type Bid = {
  _id: string;
  amount: number;
  coverLetter: string;
  status: string;
  freelancerId: {
    name: string;
    email: string;
  };
};

export default function JobBidsPage() {
  const { id } = useParams();
  const [bids, setBids] = useState<Bid[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    try {
      const res = await axios.put(
        `/api/client/bids/${bidId}/${action}`,
        {},
        { withCredentials: true }
      );
      alert(`Bid ${action}ed successfully`);
      // Update the status in the UI
      setBids((prev) =>
        prev.map((bid) =>
          bid._id === bidId ? { ...bid, status: action === 'accept' ? 'accepted' : 'rejected' } : bid
        )
      );
    } catch (err) {
      alert(`Failed to ${action} bid`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Bids for Job: <span className="text-blue-600">{title || id}</span>
      </h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {bids.length === 0 ? (
        <p className="text-gray-700">No bids submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid._id} className="border p-4 rounded shadow bg-white">
              <h2 className="font-semibold text-lg">
                {bid.freelancerId?.name} ({bid.freelancerId?.email})
              </h2>
              <p className="text-gray-700 mb-1">💰 Bid Amount: ${bid.amount}</p>
              <p className="text-gray-600 italic">{bid.coverLetter || 'No cover letter'}</p>
              <p className="text-sm text-gray-500 mt-2">
                Status: <span className="font-medium capitalize">{bid.status}</span>
              </p>

              {bid.status === 'pending' && (
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => handleStatusChange(bid._id, 'accept')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(bid._id, 'reject')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
