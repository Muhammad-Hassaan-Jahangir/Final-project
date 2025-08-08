import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import { Bid } from "@/models/bidModel";
import { PostJob } from "@/models/postjobModel";
import { Notification } from "@/models/notificationModel";
import { Milestone } from "@/models/milestoneModel";
import jwt from "jsonwebtoken";
import { createMilestone } from "@/services/blockchainService";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();

  const token = req.cookies.get("token")?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };

    // Get the bid with populated data
    const bid = await Bid.findById(params.id)
      .populate('jobId', 'title budget')
      .populate('freelancerId', 'name email walletAddress');

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Check if freelancer has a wallet address
    if (!bid.freelancerId.walletAddress) {
      return NextResponse.json(
        { error: "Freelancer does not have a wallet address set up" },
        { status: 400 }
      );
    }

    // Update bid status to accepted
    await Bid.findByIdAndUpdate(
      params.id,
      { status: "accepted" },
      { new: true }
    );

    // Get all other bids for this job before rejecting them
    const otherBids = await Bid.find({
      jobId: bid.jobId._id,
      _id: { $ne: params.id }
    }).populate('freelancerId', 'name email');

    // Reject all other bids for this job
    await Bid.updateMany(
      { jobId: bid.jobId._id, _id: { $ne: params.id } },
      { status: "rejected" }
    );

    // Create notifications for rejected freelancers
    const rejectionNotifications = otherBids.map(rejectedBid => ({
      userId: rejectedBid.freelancerId._id,
      type: 'bid_rejected',
      title: 'Bid Rejected',
      message: `Your bid of $${rejectedBid.amount} for "${bid.jobId.title}" has been rejected.`,
      relatedId: bid.jobId._id,
      relatedModel: 'PostJob'
    }));

    if (rejectionNotifications.length > 0) {
      await Notification.insertMany(rejectionNotifications);
    }

    // Update job status and assign freelancer
    await PostJob.findByIdAndUpdate(bid.jobId._id, {
      assignedTo: bid.freelancerId._id,
      status: 'in_progress'
    });

    // Create a milestone for the job with blockchain integration
    const milestone = new Milestone({
      title: `Payment for ${bid.jobId.title}`,
      description: `Escrow payment for accepted bid of $${bid.amount}`,
      status: 'in_progress',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      projectId: bid.jobId._id,
      amount: bid.amount,
      useBlockchain: true
    });

    await milestone.save();

    // Create notification for freelancer
    const notification = new Notification({
      userId: bid.freelancerId._id,
      type: 'bid_accepted',
      title: 'Bid Accepted!',
      message: `Your bid of $${bid.amount} for "${bid.jobId.title}" has been accepted. The project is now in progress.`,
      relatedId: bid.jobId._id,
      relatedModel: 'PostJob'
    });
    
    await notification.save();

    return NextResponse.json({ 
      message: "Bid accepted successfully", 
      bid,
      milestone: milestone._id,
      requiresPayment: true
    });
  } catch (err) {
    console.error('Error accepting bid:', err);
    return NextResponse.json({ error: "Error accepting bid" }, { status: 500 });
  }
}
