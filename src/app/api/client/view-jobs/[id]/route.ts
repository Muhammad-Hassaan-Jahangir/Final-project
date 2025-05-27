import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { PostJob } from "@/models/postjobModel";
import jwt from "jsonwebtoken";

export async function DELETE(
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

    const job = await PostJob.findOne({ _id: params.id, userId: decoded._id });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or you are not authorized to delete it" },
        { status: 404 }
      );
    }

    await job.deleteOne();

    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
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
    const body = await req.json();

    const updated = await PostJob.findOneAndUpdate(
      { _id: params.id, userId: decoded._id },
      {
        title: body.title,
        description: body.description,
        budget: body.budget,
        deadline: new Date(body.deadline),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job updated", job: updated });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
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

    const job = await PostJob.findOne({
      _id: params.id,
      userId: decoded._id,
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

