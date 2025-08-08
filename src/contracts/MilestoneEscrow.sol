// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MilestoneEscrow is Ownable, ReentrancyGuard {
    enum MilestoneStatus { Created, Funded, Completed, Disputed, Refunded }

    struct Milestone {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;
        string description;
        MilestoneStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }

    uint256 private nextMilestoneId;
    mapping(uint256 => Milestone) public milestones;
    
    // Platform fee percentage (e.g., 5% = 500)
    uint256 public platformFeePercent = 500;
    address public feeCollector;

    event MilestoneCreated(uint256 id, address client, address freelancer, uint256 amount, string description);
    event MilestoneCompleted(uint256 id, uint256 completedAt);
    event MilestoneDisputed(uint256 id);
    event MilestoneRefunded(uint256 id);
    event FeeCollected(uint256 milestoneId, uint256 feeAmount);

    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
        nextMilestoneId = 1;
    }

    function createMilestone(address _freelancer, string memory _description) external payable {
        require(_freelancer != address(0), "Invalid freelancer address");
        require(msg.value > 0, "Amount must be greater than 0");

        uint256 milestoneId = nextMilestoneId++;
        
        milestones[milestoneId] = Milestone({
            id: milestoneId,
            client: msg.sender,
            freelancer: _freelancer,
            amount: msg.value,
            description: _description,
            status: MilestoneStatus.Funded,
            createdAt: block.timestamp,
            completedAt: 0
        });

        emit MilestoneCreated(milestoneId, msg.sender, _freelancer, msg.value, _description);
    }

    function completeMilestone(uint256 _milestoneId) external nonReentrant {
        Milestone storage milestone = milestones[_milestoneId];
        
        require(milestone.client == msg.sender, "Only client can complete milestone");
        require(milestone.status == MilestoneStatus.Funded, "Milestone is not in funded state");

        milestone.status = MilestoneStatus.Completed;
        milestone.completedAt = block.timestamp;

        // Calculate platform fee
        uint256 feeAmount = (milestone.amount * platformFeePercent) / 10000;
        uint256 freelancerAmount = milestone.amount - feeAmount;

        // Transfer fee to platform
        if (feeAmount > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: feeAmount}("");
            require(feeSuccess, "Fee transfer failed");
            emit FeeCollected(_milestoneId, feeAmount);
        }

        // Transfer remaining amount to freelancer
        (bool success, ) = milestone.freelancer.call{value: freelancerAmount}("");
        require(success, "Transfer to freelancer failed");

        emit MilestoneCompleted(_milestoneId, block.timestamp);
    }

    function disputeMilestone(uint256 _milestoneId) external {
        Milestone storage milestone = milestones[_milestoneId];
        
        require(milestone.client == msg.sender || milestone.freelancer == msg.sender, "Only client or freelancer can dispute");
        require(milestone.status == MilestoneStatus.Funded, "Milestone is not in funded state");

        milestone.status = MilestoneStatus.Disputed;
        
        emit MilestoneDisputed(_milestoneId);
    }

    function resolveDispute(uint256 _milestoneId, address _recipient, uint256 _amount) external onlyOwner nonReentrant {
        Milestone storage milestone = milestones[_milestoneId];
        
        require(milestone.status == MilestoneStatus.Disputed, "Milestone is not disputed");
        require(_amount <= milestone.amount, "Amount exceeds milestone amount");
        require(_recipient == milestone.client || _recipient == milestone.freelancer, "Invalid recipient");

        // Calculate platform fee if paying to freelancer
        uint256 feeAmount = 0;
        uint256 transferAmount = _amount;
        
        if (_recipient == milestone.freelancer) {
            feeAmount = (_amount * platformFeePercent) / 10000;
            transferAmount = _amount - feeAmount;
            
            // Transfer fee to platform
            if (feeAmount > 0) {
                (bool feeSuccess, ) = feeCollector.call{value: feeAmount}("");
                require(feeSuccess, "Fee transfer failed");
                emit FeeCollected(_milestoneId, feeAmount);
            }
        }

        // Transfer amount to recipient
        (bool success, ) = _recipient.call{value: transferAmount}("");
        require(success, "Transfer failed");

        // If there's remaining amount, refund to client
        uint256 remainingAmount = milestone.amount - _amount;
        if (remainingAmount > 0) {
            (bool refundSuccess, ) = milestone.client.call{value: remainingAmount}("");
            require(refundSuccess, "Refund to client failed");
        }

        milestone.status = MilestoneStatus.Completed;
        milestone.completedAt = block.timestamp;
        
        emit MilestoneCompleted(_milestoneId, block.timestamp);
    }

    function refundMilestone(uint256 _milestoneId) external onlyOwner nonReentrant {
        Milestone storage milestone = milestones[_milestoneId];
        
        require(milestone.status == MilestoneStatus.Funded || milestone.status == MilestoneStatus.Disputed, 
                "Milestone must be in funded or disputed state");

        milestone.status = MilestoneStatus.Refunded;
        
        // Refund to client
        (bool success, ) = milestone.client.call{value: milestone.amount}("");
        require(success, "Refund to client failed");
        
        emit MilestoneRefunded(_milestoneId);
    }

    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = _newFeePercent;
    }

    function updateFeeCollector(address _newFeeCollector) external onlyOwner {
        require(_newFeeCollector != address(0), "Invalid fee collector address");
        feeCollector = _newFeeCollector;
    }
}