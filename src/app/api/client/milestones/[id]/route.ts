import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Milestone } from "@/models/milestoneModel";
import { PostJob } from "@/models/postjobModel";
import jwt from "jsonwebtoken";

// Get a specific milestone
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
    const milestoneId = params.id;
    
    // Fetch the milestone
    const milestone = await Milestone.findById(milestoneId);
    
    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Verify the project belongs to this client or the user is the assigned freelancer
    const project = await PostJob.findOne({ 
      _id: milestone.projectId,
      $or: [
        { userId: decoded._id },
        { assignedTo: decoded._id }
      ]
    });

    if (!project) {
      return NextResponse.json(
        { error: "Unauthorized access to this milestone" },
        { status: 403 }
      );
    }

    return NextResponse.json({ milestone }, { status: 200 });
  } catch (error) {
    console.error("Error fetching milestone:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestone" },
      { status: 500 }
    );
  }
}

// Update a milestone
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
    const milestoneId = params.id;
    const body = await req.json();
    const { title, description, status, deadline } = body;
    
    // Fetch the milestone
    const milestone = await Milestone.findById(milestoneId);
    
    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Verify the project belongs to this client or the user is the assigned freelancer
    const project = await PostJob.findOne({ 
      _id: milestone.projectId,
      $or: [
        { userId: decoded._id },
        { assignedTo: decoded._id }
      ]
    });

    if (!project) {
      return NextResponse.json(
        { error: "Unauthorized access to this milestone" },
        { status: 403 }
      );
    }

    // Update milestone fields
    if (title) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (status && ['pending', 'in_progress', 'completed'].includes(status)) {
      milestone.status = status;
    }
    if (deadline) milestone.deadline = new Date(deadline);
    
    milestone.updatedAt = new Date();
    await milestone.save();

    return NextResponse.json({ milestone }, { status: 200 });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

// Delete a milestone
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    const milestoneId = params.id;
    
    // Fetch the milestone
    const milestone = await Milestone.findById(milestoneId);
    
    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Verify the project belongs to this client
    const project = await PostJob.findOne({ 
      _id: milestone.projectId,
      userId: decoded._id
    });

    if (!project) {
      return NextResponse.json(
        { error: "Unauthorized access to this milestone" },
        { status: 403 }
      );
    }

    // Delete the milestone
    await Milestone.findByIdAndDelete(milestoneId);

    return NextResponse.json({ message: "Milestone deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json(
      { error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}