import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Bid } from "@/models/bidModel";
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

    const bid = await Bid.findByIdAndUpdate(
      params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bid rejected", bid });
  } catch (err) {
    return NextResponse.json({ error: "Error rejecting bid" }, { status: 500 });
  }
}
