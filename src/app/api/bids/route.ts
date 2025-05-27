import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Bid } from "@/models/bidModel";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
export async function POST(req: NextRequest) {
  await connect();

  const token = req.cookies.get("token")?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    const body = await req.json();

   const newBid = new Bid({
  jobId: new mongoose.Types.ObjectId(body.jobId), // ✅ ensure it's ObjectId
  freelancerId: decoded._id,
  amount: body.amount,
  coverLetter: body.coverLetter,
});

    await newBid.save();

    return NextResponse.json({ message: "Bid submitted successfully", bid: newBid });
  } catch (error) {
    console.error("Bid submission error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
