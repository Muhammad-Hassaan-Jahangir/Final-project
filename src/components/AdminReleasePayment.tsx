import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

type AdminReleasePaymentProps = {
  milestoneId: string;
  blockchainId: string;
  amount: number;
  jobTitle: string;
  onPaymentReleased: (result: any) => void;
  onError: (error: any) => void;
};

export default function AdminReleasePayment({
  milestoneId,
  blockchainId,
  amount,
  jobTitle,
  onPaymentReleased,
  onError
}: AdminReleasePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const releasePayment = async () => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/blockchain/complete-milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          milestoneId: blockchainId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the milestone status - using the correct API endpoint
        await axios.patch(`/api/client/milestones/${milestoneId}`, {
          status: 'completed',
          blockchainCompletionTx: data.transactionHash
        });
        
        onPaymentReleased(data);
      } else {
        onError(data.error || "Failed to release payment on blockchain");
      }
    } catch (error) {
      console.error("Error releasing payment:", error);
      onError("An error occurred while releasing the payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Release Payment to Freelancer</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Job:</span>
          <span className="text-sm font-medium">{jobTitle}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="text-sm font-medium">${amount} (≈ {(amount / 2000).toFixed(6)} ETH)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Blockchain ID:</span>
          <span className="text-sm font-medium">{blockchainId}</span>
        </div>
        
        <button
          onClick={releasePayment}
          disabled={isProcessing}
          className={`w-full py-2 px-4 rounded transition-colors ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
        >
          {isProcessing ? 'Processing...' : 'Release Payment'}
        </button>
        
        <p className="text-xs text-gray-500 mt-2">
          This will release the funds from escrow to the freelancer's wallet. This action cannot be undone.
        </p>
      </div>
    </div>
  );
}