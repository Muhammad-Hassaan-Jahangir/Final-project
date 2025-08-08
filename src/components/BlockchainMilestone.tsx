import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import WalletConnect from './WalletConnect';

type BlockchainMilestoneProps = {
  freelancerAddress: string;
  amount: number;
  description: string;
  onMilestoneCreated: (result: any) => void;
  onError: (error: any) => void;
};

export default function BlockchainMilestone({
  freelancerAddress,
  amount,
  description,
  onMilestoneCreated,
  onError
}: BlockchainMilestoneProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);
          setAccount(accounts[0]);
        } catch (error) {
          console.error("User denied account access");
        }
      }
    };
    
    checkWallet();
  }, []);

  const createMilestone = async () => {
    if (!provider || !account) {
      onError("Please connect your wallet first");
      return;
    }

    try {
      setIsCreating(true);
      
      const response = await fetch('/api/blockchain/create-milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          freelancerAddress,
          description,
          amount: amount.toString()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onMilestoneCreated(data);
      } else {
        onError(data.error || "Failed to create milestone on blockchain");
      }
    } catch (error) {
      console.error("Error creating milestone:", error);
      onError("An error occurred while creating the milestone");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Create Blockchain Milestone</h3>
      
      {!account ? (
        <div className="mb-4">
          <WalletConnect />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Connected Account:</span>
            <span className="text-sm font-medium">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Freelancer Address:</span>
            <span className="text-sm font-medium">{freelancerAddress.substring(0, 6)}...{freelancerAddress.substring(freelancerAddress.length - 4)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="text-sm font-medium">{amount} ETH</span>
          </div>
          
          <div>
            <span className="text-sm text-gray-600">Description:</span>
            <p className="text-sm mt-1">{description}</p>
          </div>
          
          <button
            onClick={createMilestone}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Milestone on Blockchain'}
          </button>
        </div>
      )}
    </div>
  );
}