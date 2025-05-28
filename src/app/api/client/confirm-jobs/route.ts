import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PostJob } from "@/models/postjobModel";

export async function GET(req: NextRequest) {
  await connect();

  const token = req.cookies.get("token")?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    console.log("❌ Missing token or JWT_SECRET");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    console.log("✅ Decoded client ID:", decoded._id);

    const jobs = await PostJob.find({
  userId: decoded._id,         // ✅ Correct field name
  status: "completed",
  clientConfirmed: false,
});

console.log("Decoded client ID:", decoded._id);
console.log("Matching jobs:", jobs);


    console.log("🗂 Matching jobs count:", jobs.length);
    jobs.forEach((job) => {
      console.log("📄 Job found:", {
        id: job._id.toString(),
        title: job.title,
        status: job.status,
        clientConfirmed: job.clientConfirmed,
        assignedTo: job.assignedTo?.name,
      });
    });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error("🔥 Error fetching jobs needing confirmation:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
