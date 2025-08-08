import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Update } from "@/models/updateModel";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Get all updates for a specific project
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
    
    // Get projectId from URL params
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify the project belongs to this client or the user is the assigned freelancer
    // Use mongoose.model to get the PostJob model
    const PostJob = mongoose.models.PostJob || mongoose.model("PostJob");
    
    const project = await PostJob.findOne({ 
      _id: projectId,
      $or: [
        { userId: decoded._id },
        { assignedTo: decoded._id }
      ]
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    // Fetch updates with user details
    const updates = await Update.find({ projectId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    return NextResponse.json({ updates }, { status: 200 });
  } catch (error) {
    console.error("Error fetching project updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

// Add new update to a project
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
    const body = await req.json();
    const { projectId, content } = body;
    
    if (!projectId || !content) {
      return NextResponse.json(
        { error: "Project ID and content are required" },
        { status: 400 }
      );
    }

    // Use mongoose.model to get the PostJob model
    const PostJob = mongoose.models.PostJob || mongoose.model("PostJob");

    // Verify the project exists and user is authorized (either client or assigned freelancer)
    const project = await PostJob.findOne({
      _id: projectId,
      $or: [
        { userId: decoded._id },
        { assignedTo: decoded._id }
      ]
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create new update
    const newUpdate = new Update({
      projectId,
      userId: decoded._id,
      content
    });

    await newUpdate.save();
    
    // Create notification for the freelancer if the update is from the client
    if (project.assignedTo && project.userId.toString() === decoded._id) {
      // Import the Notification model
      const Notification = mongoose.models.Notification || mongoose.model("Notification");
      
      // Create a notification for the freelancer
      const notification = new Notification({
        userId: project.assignedTo,
        type: 'message_received',
        title: 'New Project Update',
        message: `Client has added a new update to project: ${project.title}`,
        relatedId: project._id,
        relatedModel: 'PostJob',
        isRead: false
      });
      
      await notification.save();
    }

    // Return the new update with user details
    const populatedUpdate = await Update.findById(newUpdate._id)
      .populate('userId', 'name profileImage');

    return NextResponse.json({ update: populatedUpdate }, { status: 201 });
  } catch (error) {
    console.error("Error adding project update:", error);
    return NextResponse.json(
      { error: "Failed to add update" },
      { status: 500 }
    );
  }
}