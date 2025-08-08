import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { User } from "@/models/userModel";
import { PostJob } from "@/models/postjobModel";

connect();

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (userId) {
      const adminUser = await User.findById(userId);
      if (!adminUser || adminUser.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    
    // Get all jobs with populated user info
    const jobs = await PostJob.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");
    
    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Admin jobs error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { adminId, jobId, action } = await request.json();
    
    // Verify admin
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const job = await PostJob.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    // Handle different actions
    if (action === "approve") {
      job.status = "active";
      await job.save();
      return NextResponse.json({ message: "Job approved", job });
    } else if (action === "reject") {
      job.status = "rejected";
      await job.save();
      return NextResponse.json({ message: "Job rejected", job });
    } else if (action === "delete") {
      await PostJob.findByIdAndDelete(jobId);
      return NextResponse.json({ message: "Job deleted" });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Admin job update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}