import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Bid } from "@/models/bidModel";
import { User } from "@/models/userModel";
import { PostJob } from "@/models/postjobModel"; // ✅ Add this

export async function GET(
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

    const jobObjectId = new mongoose.Types.ObjectId(params.id);
    console.log("Decoded client:", decoded);
console.log("Job ID used for filter:", jobObjectId);



    const bids = await Bid.find({ jobId: jobObjectId }).populate({
      path: "freelancerId",
      select: "name email profileImage bio phone skills hourlyRate location experience portfolio walletAddress",
    });
    console.log("Fetched bids:", bids);

    const job = await PostJob.findById(jobObjectId).select("title"); // ✅ Fetch title

    console.log("Decoded JWT:", decoded);
    console.log("Job ID:", jobObjectId);
    console.log("Fetched bids:", bids);

    return NextResponse.json({ title: job?.title, bids }, { status: 200 }); // ✅ Return title too
  } catch (error) {
    console.error("Error fetching bids:", error);
    return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 });
  }
}
