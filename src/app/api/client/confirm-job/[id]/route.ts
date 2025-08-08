import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PostJob } from "@/models/postjobModel";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();

  const token = req.cookies.get("token")?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };

    const job = await PostJob.findOneAndUpdate(
      { _id: params.id, userId: decoded._id, status: "completed" },
      { clientConfirmed: true },
      { new: true }
    );

    if (!job) {
      console.warn("Job not found or not in completed status");
      return NextResponse.json(
        { error: "Job not found or not ready for confirmation" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Job confirmed", job });
  } catch (error) {
    console.error("Error confirming job:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
