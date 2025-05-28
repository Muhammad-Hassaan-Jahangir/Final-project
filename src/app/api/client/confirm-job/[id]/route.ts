import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PostJob } from "@/models/postjobModel";
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  console.log("🛠️ Connected to DB");

  const token = req.cookies.get("token")?.value;
  const jwtSecret = process.env.JWT_SECRET;
  console.log("🔐 JWT token:", token ? "[exists]" : "[missing]");

  if (!token || !jwtSecret) {
    console.error("❌ Unauthorized access - missing token or secret");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    console.log("🧠 Decoded JWT:", decoded);

    const job = await PostJob.findOneAndUpdate(
  { _id: params.id, userId: decoded._id, status: 'completed' }, // ✅ FIXED: use userId not createdBy
  { clientConfirmed: true },
  { new: true }
);


    if (!job) {
      console.warn("⚠️ Job not found or not in completed status");
      return NextResponse.json({ error: "Job not found or not ready for confirmation" }, { status: 404 });
    }

    console.log("✅ Job confirmed:", job._id);
    return NextResponse.json({ message: "Job confirmed", job });

  } catch (err) {
    console.error("💥 Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
