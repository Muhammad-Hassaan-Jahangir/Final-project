'use client';

import { useState, useEffect } from 'react';
import { 
  getMilestoneEscrowContract, 
  createMilestone, 
  getMilestoneDetails, 
  completeMilestone,
  getAllMilestoneIds // Add this import
} from '@/services/blockchainService';
import WalletConnect from '@/components/WalletConnect';

export default function TestingPage() {
  // Contract connection states
  const [contractAddress, setContractAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  
  // Create milestone states
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [milestoneAmount, setMilestoneAmount] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [milestoneResult, setMilestoneResult] = useState<any>(null);
  
  // Get milestone states
  const [milestoneId, setMilestoneId] = useState('');
  const [milestoneDetails, setMilestoneDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Complete milestone states
  const [completeMilestoneId, setCompleteMilestoneId] = useState('');
  const [completingMilestone, setCompletingMilestone] = useState(false);
  const [completionResult, setCompletionResult] = useState<any>(null);
  
  // Test contract connection
  const testConnection = async () => {
    try {
      setLoading(true);
      setError('');
      
      const contract = await getMilestoneEscrowContract();
      setContractAddress(contract.address);
      setConnected(true);
    } catch (error: any) {
      console.error('Error connecting to contract:', error);
      setError(error.message || 'Failed to connect to contract');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new milestone
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!freelancerAddress || !milestoneAmount || !milestoneDescription) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setCreatingMilestone(true);
      setError('');
      setMilestoneResult(null);
      
      const result = await createMilestone(freelancerAddress, milestoneDescription, milestoneAmount);
      
      if (result.success) {
        setMilestoneResult(result);
        // Clear form
        setFreelancerAddress('');
        setMilestoneAmount('');
        setMilestoneDescription('');
      } else {
        setError(result.error?.message || 'Failed to create milestone');
      }
    } catch (error: any) {
      console.error('Error creating milestone:', error);
      setError(error.message || 'An error occurred while creating the milestone');
    } finally {
      setCreatingMilestone(false);
    }
  };
  
  // Get milestone details
  const handleGetMilestoneDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!milestoneId) {
      setError('Please enter a milestone ID');
      return;
    }
    
    try {
      setLoadingDetails(true);
      setError('');
      setMilestoneDetails(null);
      
      const result = await getMilestoneDetails(milestoneId);
      
      if (result.success) {
        setMilestoneDetails(result.milestone);
      } else {
        //setError(result.error?.message || 'Failed to get milestone details');
      }
    } catch (error: any) {
      console.error('Error getting milestone details:', error);
      setError(error.message || 'An error occurred while getting milestone details');
    } finally {
      setLoadingDetails(false);
    }
  };
  
  // Complete a milestone
  const handleCompleteMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!completeMilestoneId) {
      setError('Please enter a milestone ID');
      return;
    }
    
    try {
      setCompletingMilestone(true);
      setError('');
      setCompletionResult(null);
      
      const result = await completeMilestone(completeMilestoneId);
      
      if (result.success) {
        setCompletionResult(result);
        // Clear form
        setCompleteMilestoneId('');
      } else {
        setError(result.error?.message || 'Failed to complete milestone');
      }
    } catch (error: any) {
      console.error('Error completing milestone:', error);
      setError(error.message || 'An error occurred while completing the milestone');
    } finally {
      setCompletingMilestone(false);
    }
  };
  
  // Add new state for milestone IDs
  const [allMilestoneIds, setAllMilestoneIds] = useState<string[]>([]);
  const [loadingMilestoneIds, setLoadingMilestoneIds] = useState(false);
  
  // Add function to fetch all milestone IDs
  const handleGetAllMilestoneIds = async () => {
    try {
      setLoadingMilestoneIds(true);
      setError('');
      
      const result = await getAllMilestoneIds();
      
      if (result.success) {
        //setAllMilestoneIds(result.milestoneIds);
      } else {
        //etError(result.error?.message || 'Failed to get milestone IDs');
      }
    } catch (error: any) {
      console.error('Error getting milestone IDs:', error);
      setError(error.message || 'An error occurred while getting milestone IDs');
    } finally {
      setLoadingMilestoneIds(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Blockchain Integration Testing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
          <WalletConnect />
        </div>
        
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Contract Connection Test</h2>
          
          <button 
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Testing...' : 'Test Contract Connection'}
          </button>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {connected && (
            <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-md mb-4">
              Successfully connected to contract!
            </div>
          )}
          
          {contractAddress && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">Contract Address:</p>
              <p className="font-mono bg-gray-100 p-2 rounded break-all">{contractAddress}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Milestone Form */}
      <div className="p-6 border rounded-lg bg-white shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Milestone</h2>
        
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Freelancer Address</label>
            <input
              type="text"
              value={freelancerAddress}
              onChange={(e) => setFreelancerAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETH)</label>
            <input
              type="text"
              value={milestoneAmount}
              onChange={(e) => setMilestoneAmount(e.target.value)}
              placeholder="0.1"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={milestoneDescription}
              onChange={(e) => setMilestoneDescription(e.target.value)}
              placeholder="Milestone description..."
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>
          
          <button
            type="submit"
            disabled={creatingMilestone}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-2 px-4 rounded-md hover:from-green-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingMilestone ? 'Creating...' : 'Create Milestone'}
          </button>
        </form>
        
        {milestoneResult && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
            <p><strong>Success!</strong> Milestone created with ID: {milestoneResult.milestoneId}</p>
            <p className="text-xs mt-1">Transaction Hash: {milestoneResult.transactionHash}</p>
          </div>
        )}
      </div>
      
      {/* Get Milestone Details */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Get Milestone Details</h2>
        
        <form onSubmit={handleGetMilestoneDetails} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Milestone ID</label>
            <input
              type="text"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              placeholder="1"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={loadingDetails}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingDetails ? 'Loading...' : 'Get Details'}
          </button>
        </form>
        
        {milestoneDetails && (
          <div className="mt-6 border rounded-md overflow-hidden">
            <div className="bg-gray-100 p-3 border-b">
              <h3 className="font-medium">Milestone #{milestoneDetails.id}</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <span className="text-sm text-gray-600 block">Client:</span>
                <span className="font-mono text-sm break-all">{milestoneDetails.client}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Freelancer:</span>
                <span className="font-mono text-sm break-all">{milestoneDetails.freelancer}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Amount:</span>
                <span>{milestoneDetails.amount} ETH</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Description:</span>
                <p className="text-sm">{milestoneDetails.description}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Status:</span>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {milestoneDetails.status}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Created:</span>
                <span>{new Date(milestoneDetails.createdAt).toLocaleString()}</span>
              </div>
              {milestoneDetails.completedAt && (
                <div>
                  <span className="text-sm text-gray-600 block">Completed:</span>
                  <span>{new Date(milestoneDetails.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Complete Milestone Form */}
      <div className="p-6 border rounded-lg bg-white shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Complete Milestone</h2>
        
        <form onSubmit={handleCompleteMilestone} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Milestone ID</label>
            <input
              type="text"
              value={completeMilestoneId}
              onChange={(e) => setCompleteMilestoneId(e.target.value)}
              placeholder="1"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={completingMilestone}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-md hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completingMilestone ? 'Completing...' : 'Complete Milestone'}
          </button>
        </form>
        
        {completionResult && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
            <p><strong>Success!</strong> Milestone completed successfully!</p>
            <p className="text-xs mt-1">Transaction Hash: {completionResult.transactionHash}</p>
          </div>
        )}
      </div>
      
      {/* Get Milestone Details */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Get Milestone Details</h2>
        
        <form onSubmit={handleGetMilestoneDetails} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Milestone ID</label>
            <input
              type="text"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              placeholder="1"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={loadingDetails}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingDetails ? 'Loading...' : 'Get Details'}
          </button>
        </form>
        
        {milestoneDetails && (
          <div className="mt-6 border rounded-md overflow-hidden">
            <div className="bg-gray-100 p-3 border-b">
              <h3 className="font-medium">Milestone #{milestoneDetails.id}</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <span className="text-sm text-gray-600 block">Client:</span>
                <span className="font-mono text-sm break-all">{milestoneDetails.client}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Freelancer:</span>
                <span className="font-mono text-sm break-all">{milestoneDetails.freelancer}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Amount:</span>
                <span>{milestoneDetails.amount} ETH</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Description:</span>
                <p className="text-sm">{milestoneDetails.description}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Status:</span>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {milestoneDetails.status}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Created:</span>
                <span>{new Date(milestoneDetails.createdAt).toLocaleString()}</span>
              </div>
              {milestoneDetails.completedAt && (
                <div>
                  <span className="text-sm text-gray-600 block">Completed:</span>
                  <span>{new Date(milestoneDetails.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Add this new section before the end of the component */}
      <div className="p-6 border rounded-lg bg-white shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">All Milestone IDs</h2>
        
        <button
          onClick={handleGetAllMilestoneIds}
          disabled={loadingMilestoneIds}
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loadingMilestoneIds ? 'Loading...' : 'Get All Milestone IDs'}
        </button>
        
        {allMilestoneIds.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Available Milestone IDs:</h3>
            <div className="flex flex-wrap gap-2">
              {allMilestoneIds.map(id => (
                <div 
                  key={id} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full cursor-pointer hover:bg-blue-200"
                  onClick={() => {
                    // Set the ID in both forms for convenience
                    setMilestoneId(id);
                    setCompleteMilestoneId(id);
                  }}
                >
                  ID: {id}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            {loadingMilestoneIds ? 'Loading milestone IDs...' : 'No milestone IDs found or click the button to load them'}
          </p>
        )}
      </div>
      
      {/* Get Milestone Details */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Get Milestone Details</h2>
        
        <form onSubmit={handleGetMilestoneDetails} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Milestone ID</label>
            <input
              type="text"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              placeholder="1"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <button
            type="submit"
            disabled={loadingDetails}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingDetails ? 'Loading...' : 'Get Details'}
          </button>
        </form>
        
        {milestoneDetails && (
          <div className="mt-6 border rounded-md overflow-hidden">
            <div className="bg-gray-100 p-3 border-b">
              <h3 className="font-medium">Milestone #{milestoneDetails.id}</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <span className="text-sm text-gray-600 block">Client:</span>
                <span className="font-mono text-sm break-all">{milestoneDetails.client}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Freelancer:</span>
                <span className="font-mono text-sm break-all">{milestoneDetails.freelancer}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Amount:</span>
                <span>{milestoneDetails.amount} ETH</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Description:</span>
                <p className="text-sm">{milestoneDetails.description}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Status:</span>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {milestoneDetails.status}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Created:</span>
                <span>{new Date(milestoneDetails.createdAt).toLocaleString()}</span>
              </div>
              {milestoneDetails.completedAt && (
                <div>
                  <span className="text-sm text-gray-600 block">Completed:</span>
                  <span>{new Date(milestoneDetails.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
