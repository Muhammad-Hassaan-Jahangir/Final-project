'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

type Bid = {
  _id: string;
  amount: number;
  coverLetter: string;
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
            <div
              key={bid._id}
              className="border p-4 rounded shadow bg-white"
            >
              <h2 className="font-semibold text-lg">
                {bid.freelancerId?.name} ({bid.freelancerId?.email})
              </h2>
              <p className="text-gray-700 mb-1">
                💰 Bid Amount: ${bid.amount}
              </p>
              <p className="text-gray-600 italic">
                {bid.coverLetter || 'No cover letter'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
