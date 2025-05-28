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

    // ✅ Log before update
    const jobBefore = await PostJob.findById(params.id);
    console.log("📄 Job before update:", jobBefore);

    const job = await PostJob.findOneAndUpdate(
      { _id: params.id, assignedTo: decoded._id },
      { status: "completed", clientConfirmed: false },
      { new: true }
    );

    if (!job) {
      console.warn("❌ Job not found or not assigned to this freelancer");
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    // ✅ Log after update
    console.log("✅ Job after update:", job);

    return NextResponse.json({ message: "Job marked as completed", job });
  } catch (error) {
    console.error("🔥 Error completing job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
