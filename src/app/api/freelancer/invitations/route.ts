import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Invitation } from "@/models/invitationModel";
import { Notification } from "@/models/notificationModel";
import { User } from "@/models/userModel";
import jwt from "jsonwebtoken";

// Get all invitations for a freelancer
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
    
    // Verify user is a freelancer
    const freelancer = await User.findById(decoded._id);
    if (!freelancer || freelancer.role !== 'freelancer') {
      return NextResponse.json(
        { error: "Access denied: Freelancers only" },
        { status: 403 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    // Build query
    const query: any = { freelancerId: decoded._id };
    
    if (status) {
      query.status = status;
    }

    // Fetch invitations
    const invitations = await Invitation.find(query)
      .populate('jobId', 'title description budget deadline category skills')
      .populate('clientId', 'name email profileImage')
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

// Update invitation status (accept or reject)
export async function PUT(req: NextRequest) {
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
    
    // Verify user is a freelancer
    const freelancer = await User.findById(decoded._id);
    if (!freelancer || freelancer.role !== 'freelancer') {
      return NextResponse.json(
        { error: "Access denied: Freelancers only" },
        { status: 403 }
      );
    }

    const { invitationId, status, message } = await req.json();

    // Validate required fields
    if (!invitationId || !status) {
      return NextResponse.json(
        { error: "Invitation ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    if (status !== 'accepted' && status !== 'rejected') {
      return NextResponse.json(
        { error: "Status must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    // Find invitation
    const invitation = await Invitation.findOne({
      _id: invitationId,
      freelancerId: decoded._id,
      status: 'pending'
    }).populate('jobId', 'title userId status');

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or already processed" },
        { status: 404 }
      );
    }

    // Update invitation
    invitation.status = status;
    invitation.updatedAt = new Date();
    await invitation.save();

    // If accepted, update job status
    if (status === 'accepted') {
      const { PostJob } = await import("@/models/postjobModel");
      await PostJob.findByIdAndUpdate(invitation.jobId._id, {
        assignedTo: decoded._id,
        status: 'in_progress'
      });
    }

    // Create notification for client
    const notificationType = status === 'accepted' ? 'invitation_accepted' : 'invitation_rejected';
    const notificationTitle = status === 'accepted' ? 'Invitation Accepted' : 'Invitation Rejected';
    const notificationMessage = status === 'accepted' 
      ? `${freelancer.name} has accepted your invitation for "${invitation.jobId.title}"`
      : `${freelancer.name} has rejected your invitation for "${invitation.jobId.title}"${message ? `: ${message}` : ''}`;

    const notification = new Notification({
      userId: invitation.jobId.userId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      relatedId: invitation.jobId._id,
      relatedModel: 'PostJob'
    });
    
    await notification.save();

    return NextResponse.json({ 
      message: `Invitation ${status} successfully`, 
      invitation 
    });
  } catch (error) {
    console.error("Error updating invitation:", error);
    return NextResponse.json(
      { error: "Failed to update invitation" },
      { status: 500 }
    );
  }
}