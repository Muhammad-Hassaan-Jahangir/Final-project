import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Bid } from "@/models/bidModel";
import { Notification } from "@/models/notificationModel";
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

    // Get the bid with populated data before updating
    const bid = await Bid.findById(params.id)
      .populate('jobId', 'title budget')
      .populate('freelancerId', 'name email');

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Update bid status to rejected
    await Bid.findByIdAndUpdate(
      params.id,
      { status: "rejected" },
      { new: true }
    );

    // Create notification for freelancer
    const notification = new Notification({
      userId: bid.freelancerId._id,
      type: 'bid_rejected',
      title: 'Bid Rejected',
      message: `Your bid of $${bid.amount} for "${bid.jobId.title}" has been rejected.`,
      relatedId: bid.jobId._id,
      relatedModel: 'PostJob'
    });
    
    await notification.save();

    return NextResponse.json({ message: "Bid rejected", bid });
  } catch (err) {
    return NextResponse.json({ error: "Error rejecting bid" }, { status: 500 });
  }
}
