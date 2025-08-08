import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Feedback } from "@/models/feedbackModel";
import { PostJob } from "@/models/postjobModel";
import jwt from "jsonwebtoken";

// Get all feedback for a specific project
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

    // Verify the project belongs to this client
    const project = await PostJob.findOne({ 
      _id: projectId,
      userId: decoded._id 
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    // Fetch feedback with user details
    const feedback = await Feedback.find({ projectId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    return NextResponse.json({ feedback }, { status: 200 });
  } catch (error) {
    console.error("Error fetching project feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// Add new feedback to a project
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
    const { projectId, comment } = body;
    
    if (!projectId || !comment) {
      return NextResponse.json(
        { error: "Project ID and comment are required" },
        { status: 400 }
      );
    }

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

    // Create new feedback
    const newFeedback = new Feedback({
      projectId,
      userId: decoded._id,
      comment
    });

    await newFeedback.save();

    // Return the new feedback with user details
    const populatedFeedback = await Feedback.findById(newFeedback._id)
      .populate('userId', 'name profileImage');

    return NextResponse.json({ feedback: populatedFeedback }, { status: 201 });
  } catch (error) {
    console.error("Error adding project feedback:", error);
    return NextResponse.json(
      { error: "Failed to add feedback" },
      { status: 500 }
    );
  }
}