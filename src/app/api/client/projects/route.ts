
import { connect } from "@/helper/db";
import { PostJob } from "@/models/postjobModel";
import { Milestone } from "@/models/milestoneModel";
import { Bid } from "@/models/bidModel";
import { User } from "@/models/userModel";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";


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
    
    // Verify user is a client
    const user = await User.findById(decoded._id);
    if (!user || user.role !== 'client') {
      return NextResponse.json(
        { error: "Access denied: Clients only" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const projectId = url.searchParams.get("projectId");

    // Get specific project with detailed information
    if (projectId) {
      const project = await PostJob.findOne({
        _id: projectId,
        userId: decoded._id
      })
      .populate('assignedTo', 'name profileImage hourlyRate skills')
      .populate('userId', 'name profileImage');

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Get bids for this project
      const bids = await Bid.find({ jobId: projectId })
        .populate('freelancerId', 'name profileImage hourlyRate skills')
        .sort({ createdAt: -1 });

      // Get milestones for this project
      const milestones = await Milestone.find({ projectId })
        .sort({ dueDate: 1 });

      return NextResponse.json({
        project,
        bids,
        milestones
      }, { status: 200 });
    }

    // Build query based on status filter
    let query: any = { userId: decoded._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get all projects for the client
    const projects = await PostJob.find(query)
      .populate('assignedTo', 'name profileImage hourlyRate')
      .sort({ createdAt: -1 });

    // Get bid counts and milestones for each project
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const bidCount = await Bid.countDocuments({ jobId: project._id });
        const pendingBids = await Bid.countDocuments({ 
          jobId: project._id, 
          status: 'pending' 
        });
        const milestones = await Milestone.find({ projectId: project._id });
        
        return {
          ...project.toObject(),
          bidCount,
          pendingBids,
          milestones
        };
      })
    );

    return NextResponse.json({ projects: projectsWithDetails }, { status: 200 });

  } catch (error) {
    console.error("Error fetching client projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// Update project status or assign freelancer
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
    const { projectId, action, freelancerId, bidId, status } = await req.json();

    // Verify project belongs to client
    const project = await PostJob.findOne({
      _id: projectId,
      userId: decoded._id
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    if (action === 'assign_freelancer') {
      // Assign freelancer to project
      if (!freelancerId || !bidId) {
        return NextResponse.json(
          { error: "Freelancer ID and Bid ID are required" },
          { status: 400 }
        );
      }

      // Update project
      project.assignedTo = freelancerId;
      project.status = 'in_progress';
      await project.save();

      // Update the accepted bid
      await Bid.findByIdAndUpdate(bidId, { status: 'accepted' });

      // Reject other bids
      await Bid.updateMany(
        { jobId: projectId, _id: { $ne: bidId } },
        { status: 'rejected' }
      );

      return NextResponse.json(
        { message: "Freelancer assigned successfully", project },
        { status: 200 }
      );
    }

    if (action === 'update_status') {
      if (!['open', 'in_progress', 'under_review', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }

      project.status = status;
      await project.save();

      return NextResponse.json(
        { message: "Project status updated successfully", project },
        { status: 200 }
      );
    }

    if (action === 'confirm_completion') {
      project.status = 'completed';
      project.clientConfirmation = true;
      await project.save();

      return NextResponse.json(
        { message: "Project completion confirmed", project },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}