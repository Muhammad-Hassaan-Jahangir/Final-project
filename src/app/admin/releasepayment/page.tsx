'use client';

import { useState } from 'react';
import { 
  getMilestoneDetails, 
  completeMilestone,
  getAllMilestoneIds 
} from '@/services/blockchainService';

export default function TestingPage() {
  const [error, setError] = useState('');
  
  // Get all milestone IDs
  const [allMilestoneIds, setAllMilestoneIds] = useState<string[]>([]);
  const [loadingMilestoneIds, setLoadingMilestoneIds] = useState(false);

  const handleGetAllMilestoneIds = async () => {
    try {
      setLoadingMilestoneIds(true);
      setError('');
      const result = await getAllMilestoneIds();
      if (result.success) {
        //setAllMilestoneIds(result.milestoneIds);
      } else {
        //setError(result.error?.message || 'Failed to get milestone IDs');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while getting milestone IDs');
    } finally {
      setLoadingMilestoneIds(false);
    }
  };

  // Get milestone details
  const [milestoneId, setMilestoneId] = useState('');
  const [milestoneDetails, setMilestoneDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleGetMilestoneDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneId) return setError('Please enter a milestone ID');
    try {
      setLoadingDetails(true);
      setError('');
      const result = await getMilestoneDetails(milestoneId);
      if (result.success) {
        setMilestoneDetails(result.milestone);
      } 
    } catch (error: any) {
      setError(error.message || 'Error getting milestone details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Complete milestone
  const [completeMilestoneId, setCompleteMilestoneId] = useState('');
  const [completingMilestone, setCompletingMilestone] = useState(false);
  const [completionResult, setCompletionResult] = useState<any>(null);

  const handleCompleteMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeMilestoneId) return setError('Please enter a milestone ID');
    try {
      setCompletingMilestone(true);
      setError('');
      const result = await completeMilestone(completeMilestoneId);
      if (result.success) {
        setCompletionResult(result);
        setCompleteMilestoneId('');
      } else {
        setError(result.error?.message || 'Failed to complete milestone');
      }
    } catch (error: any) {
      setError(error.message || 'Error completing milestone');
    } finally {
      setCompletingMilestone(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Milestone Dashboard</h1>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Get All Milestone IDs */}
      <div className="p-6 border rounded-lg bg-white shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">All Payment IDs</h2>
        <button
          onClick={handleGetAllMilestoneIds}
          disabled={loadingMilestoneIds}
          className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition"
        >
          {loadingMilestoneIds ? 'Loading...' : 'Get All Payment IDs'}
        </button>

        {allMilestoneIds.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">IDs:</h3>
            <div className="flex flex-wrap gap-2">
              {allMilestoneIds.map((id, index) => (
                <div
                  key={id}
                  onClick={() => {
                    setMilestoneId(id);
                    setCompleteMilestoneId(id);
                  }}
                  className="cursor-pointer px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Complete Milestone */}
      <div className="p-6 border rounded-lg bg-white shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Release Payment</h2>
        <form onSubmit={handleCompleteMilestone} className="space-y-4">
          <input
            type="text"
            value={completeMilestoneId}
            onChange={(e) => setCompleteMilestoneId(e.target.value)}
            placeholder="Enter Payment ID"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={completingMilestone}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            {completingMilestone ? 'Releasing...' : 'Release Payment'}
          </button>
        </form>
        {completionResult && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            Milestone completed! Tx: {completionResult.transactionHash}
          </div>
        )}
      </div>

      {/* Get Milestone Details */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Get Payment Details</h2>
        <form onSubmit={handleGetMilestoneDetails} className="space-y-4">
          <input
            type="text"
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
            placeholder="Enter Payment ID"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loadingDetails}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            {loadingDetails ? 'Loading...' : 'Get Details'}
          </button>
        </form>

        {milestoneDetails && (
          <div className="mt-4 border rounded p-4 bg-gray-50">
            <p><strong>ID:</strong> {milestoneDetails.id}</p>
            <p><strong>Client:</strong> {milestoneDetails.client}</p>
            <p><strong>Freelancer:</strong> {milestoneDetails.freelancer}</p>
            <p><strong>Amount:</strong> {milestoneDetails.amount} ETH</p>
            <p><strong>Description:</strong> {milestoneDetails.description}</p>
            <p><strong>Status:</strong> {milestoneDetails.status}</p>
            <p><strong>Created:</strong> {new Date(milestoneDetails.createdAt).toLocaleString()}</p>
            {milestoneDetails.completedAt && (
              <p><strong>Completed:</strong> {new Date(milestoneDetails.completedAt).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
