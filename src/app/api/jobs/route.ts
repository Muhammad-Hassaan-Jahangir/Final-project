import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { PostJob } from "@/models/postjobModel";

export async function GET(req: NextRequest) {
  await connect();

  try {
    const jobs = await PostJob.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
