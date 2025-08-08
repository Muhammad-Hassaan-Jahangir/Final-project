import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Milestone } from "@/models/milestoneModel";
import jwt from "jsonwebtoken";

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
    const projectId = url.searchParams.get('projectId');
    
    let query = {};
    if (projectId) {
      query = { projectId };
    }

    const milestones = await Milestone.find(query);

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}



export async function PATCH(req: NextRequest) {
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
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Milestone ID is required" },
        { status: 400 }
      );
    }

    const updatedMilestone = await Milestone.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedMilestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ milestone: updatedMilestone });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}