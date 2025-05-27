import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import { Bid } from "@/models/bidModel";
import { PostJob } from "@/models/postjobModel";
import jwt from "jsonwebtoken";

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

    // Update bid status to accepted
    const bid = await Bid.findByIdAndUpdate(
      params.id,
      { status: "accepted" },
      { new: true }
    );

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Optionally assign freelancer to job
    await PostJob.findByIdAndUpdate(bid.jobId, {
      assignedTo: bid.freelancerId,
    });

    return NextResponse.json({ message: "Bid accepted", bid });
  } catch (err) {
    return NextResponse.json({ error: "Error accepting bid" }, { status: 500 });
  }
}
