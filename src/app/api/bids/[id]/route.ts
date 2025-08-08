import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import { Bid } from "@/models/bidModel";
import jwt from "jsonwebtoken";

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
    const bidId = params.id;

    const bid = await Bid.findById(bidId)
      .populate('jobId', '_id title')
      .populate('freelancerId', '_id name email');

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    return NextResponse.json({ bid });
  } catch (error) {
    console.error("Error fetching bid:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}