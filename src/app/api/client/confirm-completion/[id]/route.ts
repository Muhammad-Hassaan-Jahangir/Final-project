import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import { PostJob } from "@/models/postjobModel";
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
    const { confirmed, feedback } = await req.json();

    // Find the job and verify client ownership
    const job = await PostJob.findOne({
      _id: params.id,
      userId: decoded._id,
      status: 'completed'
    }).populate('assignedTo', 'name email');

    if (!job) {
      return NextResponse.json({ 
        error: "Job not found or not owned by you" 
      }, { status: 404 });
    }

    // Update job confirmation status
    await PostJob.findByIdAndUpdate(params.id, {
      clientConfirmed: confirmed,
      clientFeedback: feedback || '',
      status: confirmed ? 'completed' : 'in_progress' // Set to in_progress if revision requested
    });

    // Create notification for freelancer about confirmation or revision
    const notification = new Notification({
      userId: job.assignedTo._id,
      type: confirmed ? 'project_confirmed' : 'revision_requested',
      title: confirmed ? 'Project Confirmed' : 'Revision Requested',
      message: confirmed 
        ? `The client has confirmed completion of "${job.title}". Great work!`
        : `The client has requested revisions for "${job.title}". Please check the feedback and make necessary changes.`,
      relatedId: job._id,
      relatedModel: 'PostJob'
    });
    
    await notification.save();

    return NextResponse.json({ 
      message: confirmed ? "Project confirmed successfully" : "Feedback submitted"
    });
  } catch (err) {
    console.error('Error confirming project:', err);
    return NextResponse.json({ 
      error: "Error processing confirmation" 
    }, { status: 500 });
  }
}