import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { createMilestone } from '@/services/blockchainService'; // Import directly from blockchainService

type BidAcceptPaymentProps = {
  freelancerAddress: string;
  amount: number;
  bidId: string;
  jobTitle: string;
  milestoneId: string;
  onPaymentComplete: (result: any) => void;
  onError: (error: any) => void;
};

export default function BidAcceptPayment({
  freelancerAddress,
  amount,
  bidId,
  jobTitle,
  milestoneId,
  onPaymentComplete,
  onError
}: BidAcceptPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  // Validate freelancer address early
  useEffect(() => {
    if (!freelancerAddress || freelancerAddress.trim() === '') {
      onError("Freelancer has not connected a wallet address. Please ask them to set up their wallet before proceeding.");
    }
  }, [freelancerAddress, onError]);

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

  const createEscrowPayment = async () => {
    if (!provider || !account) {
      onError("Please connect your wallet first");
      return;
    }

    if (!freelancerAddress || freelancerAddress.trim() === '') {
      onError("Freelancer has not connected a wallet address");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Convert amount to ETH (this is a simplified conversion for demo purposes)
      // In a real app, you'd use an oracle or API to get the current exchange rate
      const ethAmount = (amount / 2000).toFixed(6); // Assuming 1 ETH = $2000 USD
      
      // Use direct blockchain service call instead of API route
      const result = await createMilestone(
        freelancerAddress,
        `Payment for job: ${jobTitle}`,
        ethAmount
      );
      
      if (result.success) {
        // Update the milestone with blockchain ID
        await axios.patch(`/api/client/milestones/${milestoneId}`, {
          blockchainId: result.milestoneId,
          transactionHash: result.transactionHash
        });
        
        onPaymentComplete(result);
      } else {
        onError(result.error?.message || "Failed to create escrow payment on blockchain");
      }
    } catch (error: any) {
      console.error("Error creating escrow payment:", error);
      onError("An error occurred while creating the escrow payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        setAccount(accounts[0]);
      } else {
        alert("Please install MetaMask or another Ethereum wallet");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Create Escrow Payment</h3>
      
      {!account ? (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Connect your wallet to create an escrow payment for this job.
          </p>
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Your Wallet:</span>
            <span className="text-sm font-medium">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Freelancer Address:</span>
            <span className="text-sm font-medium">{freelancerAddress.substring(0, 6)}...{freelancerAddress.substring(freelancerAddress.length - 4)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="text-sm font-medium">${amount} (≈ {(amount / 2000).toFixed(6)} ETH)</span>
          </div>
          
          <button
            onClick={createEscrowPayment}
            disabled={isProcessing}
            className={`w-full py-2 px-4 rounded transition-colors ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {isProcessing ? 'Processing...' : 'Create Escrow Payment'}
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            This will create an escrow payment on the blockchain. The funds will be held in escrow until the job is completed and approved.
          </p>
        </div>
      )}
    </div>
  );
}