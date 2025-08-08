import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function WalletConnect() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);
          setAccount(accounts[0]);
          
          const balance = await web3Provider.getBalance(accounts[0]);
          setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.log("No Ethereum browser extension detected");
      }
    };
    
    checkWallet();
  }, []);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        setAccount(accounts[0]);
        
        const balance = await web3Provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(balance));
      } else {
        alert("Please install MetaMask or another Ethereum wallet");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Blockchain Wallet</h3>
      
      {!account ? (
        <button 
          onClick={connectWallet}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Connected Account:</span>
            <span className="text-sm font-medium">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Balance:</span>
            <span className="text-sm font-medium">{parseFloat(balance).toFixed(4)} ETH</span>
          </div>
        </div>
      )}
    </div>
  );
}