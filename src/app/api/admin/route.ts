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
    
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get dashboard stats
    const totalUsers = await User.countDocuments();
    const clientCount = await User.countDocuments({ role: "client" });
    const freelancerCount = await User.countDocuments({ role: "freelancer" });
    const totalJobs = await PostJob.countDocuments();
    const activeJobs = await PostJob.countDocuments({ status: "active" });
    const completedJobs = await PostJob.countDocuments({ status: "completed" });
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ _id: -1 })
      .limit(5)
      .select("name email role createdAt");
    
    // Get recent jobs
    const recentJobs = await PostJob.find({ userId: { $exists: true } })
      .sort({ _id: -1 })
      .limit(5)
      .populate("userId", "name email");
    
    return NextResponse.json({
      stats: {
        totalUsers,
        clientCount,
        freelancerCount,
        totalJobs,
        activeJobs,
        completedJobs,
      },
      recentUsers,
      recentJobs,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}