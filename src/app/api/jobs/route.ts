import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { PostJob } from "@/models/postjobModel";
import { User } from "@/models/userModel";

export async function GET(req: NextRequest) {
  await connect();

  try {
    // Only fetch jobs that are not assigned to any freelancer (assignedTo is null)
    const jobs = await PostJob.find({ assignedTo: null, status: 'pending' })
      .populate('userId', 'name email profileImage')
      .select('title description budget basicBudget expertBudget deadline category subcategory skills jobType additionalRequirements attachments image')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error.message },
      { status: 500 }
    );
  }
}
