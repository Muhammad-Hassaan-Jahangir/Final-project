import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Bid } from "@/models/bidModel";

export async function PATCH(
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
    const decoded = jwt.verify(token, jwtSecret) as { _id: string; role: string };

    if (decoded.role !== "freelancer") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const bidId = new mongoose.Types.ObjectId(params.id);

    const bid = await Bid.findOne({ _id: bidId, freelancerId: decoded._id });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    bid.status = "completed";
    await bid.save();

    return NextResponse.json({ message: "Bid marked as completed" }, { status: 200 });
  } catch (error) {
    console.error("Error marking bid as completed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
