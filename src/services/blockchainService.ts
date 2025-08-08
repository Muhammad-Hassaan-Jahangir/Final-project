import { ethers } from 'ethers';
import MilestoneEscrowABI from '../contracts/MilestoneEscrow.json';

// Read and validate contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MILESTONE_ESCROW_ADDRESS || '';

if (!ethers.utils.isAddress(CONTRACT_ADDRESS)) {
  throw new Error(`❌ Invalid or missing MilestoneEscrow address: "${CONTRACT_ADDRESS}"`);
}

// Get provider (ENS resolution is NOT supported on Sepolia)
export const getProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.providers.Web3Provider((window as any).ethereum, 'any');
  }

  const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

// Get signer
export const getSigner = async () => {
  const provider = getProvider();
  if (provider instanceof ethers.providers.Web3Provider) {
    await provider.send('eth_requestAccounts', []);
    return provider.getSigner();
  }
  return null;
};

// Get contract instance
export const getMilestoneEscrowContract = async (withSigner = false) => {
  const provider = getProvider();

  if (withSigner) {
    const signer = await getSigner();
    if (!signer) throw new Error('❌ No signer available');
    return new ethers.Contract(CONTRACT_ADDRESS, MilestoneEscrowABI.abi, signer);
  }

  return new ethers.Contract(CONTRACT_ADDRESS, MilestoneEscrowABI.abi, provider);
};

// Create a new milestone
export const createMilestone = async (freelancerAddress: string, description: string, amount: string) => {
  try {
    if (!ethers.utils.isAddress(freelancerAddress)) {
      throw new Error(`❌ Invalid freelancer address: ${freelancerAddress}`);
    }

    const contract = await getMilestoneEscrowContract(true);
    const tx = await contract.createMilestone(freelancerAddress, description, {
      value: ethers.utils.parseEther(amount),
    });

    const receipt = await tx.wait();
    const event = receipt.events.find((e: any) => e.event === 'MilestoneCreated');

    let milestoneId = '';
    if (event?.args?.id) {
      milestoneId = event.args.id.toString();
    }

    return {
      success: true,
      milestoneId,
      transactionHash: receipt.transactionHash,
    };
  } catch (error: any) {
    if (error.code === 'ACTION_REJECTED') {
      return { success: false, error: new Error('Transaction rejected in MetaMask.') };
    }
    return { success: false, error };
  }
};

// Complete a milestone
export const completeMilestone = async (milestoneId: string) => {
  try {
    const contract = await getMilestoneEscrowContract(true);
    const tx = await contract.completeMilestone(milestoneId);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.transactionHash,
    };
  } catch (error: any) {
    if (error.code === 'ACTION_REJECTED') {
      return { success: false, error: new Error('Transaction rejected in MetaMask.') };
    }
    return { success: false, error };
  }
};

// Get milestone details
export const getMilestoneDetails = async (milestoneId: string) => {
  try {
    const contract = await getMilestoneEscrowContract();
    const milestone = await contract.milestones(milestoneId);

    if (
      milestoneId !== '0' &&
      milestone.id.toString() === '0' &&
      milestone.client === '0x0000000000000000000000000000000000000000'
    ) {
      return {
        success: false,
        error: new Error(`Milestone with ID ${milestoneId} does not exist`),
      };
    }

    return {
      success: true,
      milestone: {
        id: milestone.id.toString(),
        client: milestone.client,
        freelancer: milestone.freelancer,
        amount: ethers.utils.formatEther(milestone.amount),
        description: milestone.description,
        status: ['Created', 'Funded', 'Completed', 'Disputed', 'Refunded'][milestone.status],
        createdAt: new Date(milestone.createdAt.toNumber() * 1000).toISOString(),
        completedAt:
          milestone.completedAt.toNumber() > 0
            ? new Date(milestone.completedAt.toNumber() * 1000).toISOString()
            : null,
      },
    };
  } catch (error) {
    return { success: false, error };
  }
};

// Get next milestone ID
export const getNextMilestoneId = async () => {
  try {
    const contract = await getMilestoneEscrowContract();
    const filter = contract.filters.MilestoneCreated();
    const events = await contract.queryFilter(filter);

    let highestId = 0;
    for (const event of events) {
      const id = parseInt(event.args.id.toString());
      if (id > highestId) highestId = id;
    }

    return {
      success: true,
      nextMilestoneId: (highestId + 1).toString(),
    };
  } catch (error) {
    return { success: false, error };
  }
};

// Get all milestone IDs
export const getAllMilestoneIds = async () => {
  try {
    const contract = await getMilestoneEscrowContract();
    const filter = contract.filters.MilestoneCreated();
    const events = await contract.queryFilter(filter);

    const milestoneIds = events.map((event) => event.args.id.toString());
    return { success: true, milestoneIds };
  } catch (error) {
    return { success: false, error };
  }
};
