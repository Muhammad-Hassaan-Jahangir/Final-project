import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Invitation } from "@/models/invitationModel";
import { PostJob } from "@/models/postjobModel";
import { Notification } from "@/models/notificationModel";
import { User } from "@/models/userModel";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Create a new invitation
export async function POST(req: NextRequest) {
  await connect();

  try {
    const token = req.cookies.get("token")?.value;
    const jwtSecret = process.env.JWT_SECRET;

    if (!token || !jwtSecret) {
      return NextResponse.json(
        { error: "Unauthorized: No token or secret" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    
    // Verify user is a client
    const client = await User.findById(decoded._id);
    if (!client || client.role !== 'client') {
      return NextResponse.json(
        { error: "Access denied: Clients only" },
        { status: 403 }
      );
    }

    const { jobId, freelancerId, message } = await req.json();
    
    // Validate required fields
    if (!jobId || !freelancerId) {
      return NextResponse.json(
        { error: "Job ID and Freelancer ID are required" },
        { status: 400 }
      );
    }
    
    // Convert string IDs to ObjectIds if they're not already
    const jobObjectId = mongoose.Types.ObjectId.isValid(jobId) ? 
      new mongoose.Types.ObjectId(jobId) : jobId;
    
    const freelancerObjectId = mongoose.Types.ObjectId.isValid(freelancerId) ? 
      new mongoose.Types.ObjectId(freelancerId) : freelancerId;
    
    // Check if job exists and belongs to the client
    const job = await PostJob.findOne({ _id: jobObjectId, userId: decoded._id });
    if (!job) {
      return NextResponse.json(
        { error: "Job not found or doesn't belong to you" },
        { status: 404 }
      );
    }

    // Check if freelancer exists
    const freelancer = await User.findOne({ _id: freelancerObjectId, role: 'freelancer' });
    if (!freelancer) {
      return NextResponse.json(
        { error: "Freelancer not found" },
        { status: 404 }
      );
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      jobId: jobObjectId,
      freelancerId: freelancerObjectId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent to this freelancer" },
        { status: 400 }
      );
    }

    // Create new invitation
    const invitation = new Invitation({
      jobId: jobObjectId,
      freelancerId: freelancerObjectId,
      clientId: decoded._id,
      message: message || '',
      status: 'pending'
    });

    await invitation.save();

    // Create notification for freelancer
    const notification = new Notification({
      userId: freelancerObjectId,
      type: 'job_invitation',
      title: 'New Job Invitation',
      message: `You have received a job invitation for "${job.title}"`,
      relatedId: invitation._id,
      relatedModel: 'PostJob'
    });
    
    await notification.save();

    return NextResponse.json({ 
      message: "Invitation sent successfully", 
      invitation 
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

// Get all invitations for a client
export async function GET(req: NextRequest) {
  await connect();

  try {
    const token = req.cookies.get("token")?.value;
    const jwtSecret = process.env.JWT_SECRET;

    if (!token || !jwtSecret) {
      return NextResponse.json(
        { error: "Unauthorized: No token or secret" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const jobId = url.searchParams.get("jobId");

    // Build query
    const query: any = { clientId: decoded._id };
    
    if (status) {
      query.status = status;
    }
    
    if (jobId) {
      // Convert jobId string to ObjectId if needed
      query.jobId = mongoose.Types.ObjectId.isValid(jobId) ? 
        new mongoose.Types.ObjectId(jobId) : jobId;
    }

    // Fetch invitations
    const invitations = await Invitation.find(query)
      .populate('jobId', 'title description budget deadline')
      .populate('freelancerId', 'name email profileImage')
      .sort({ createdAt: -1 });

    return NextResponse.json({ invitations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}