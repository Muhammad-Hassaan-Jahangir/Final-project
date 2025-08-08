import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Milestone } from "@/models/milestoneModel";
import { PostJob } from "@/models/postjobModel";
import jwt from "jsonwebtoken";

// Get all milestones for a specific project
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

    // Fetch milestones
    const milestones = await Milestone.find({ projectId })
      .sort({ deadline: 1 });

    return NextResponse.json({ milestones }, { status: 200 });
  } catch (error) {
    console.error("Error fetching project milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}

// Add new milestone to a project
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
    const { projectId, title, description, deadline } = body;
    
    if (!projectId || !title || !deadline) {
      return NextResponse.json(
        { error: "Project ID, title, and deadline are required" },
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

    // Create new milestone
    const newMilestone = new Milestone({
      projectId,
      title,
      description: description || "",
      deadline: new Date(deadline),
      status: "pending"
    });

    await newMilestone.save();

    return NextResponse.json({ milestone: newMilestone }, { status: 201 });
  } catch (error) {
    console.error("Error adding project milestone:", error);
    return NextResponse.json(
      { error: "Failed to add milestone" },
      { status: 500 }
    );
  }
}