import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { PostJob } from "@/models/postjobModel";
import { Bid } from "@/models/bidModel";
import { User } from "@/models/userModel";
import jwt from "jsonwebtoken";

// Get freelancer's projects and bids
export async function GET(req: NextRequest) {
  await connect();

  try {
    const token = req.cookies.get("token")?.value;
    const jwtSecret = process.env.JWT_SECRET;

    if (!token || !jwtSecret) {
      return NextResponse.json(
        { error: "Unauthorized: No token or secret" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    
    // Verify user is a freelancer
    const user = await User.findById(decoded._id);
    if (!user || user.role !== 'freelancer') {
      return NextResponse.json(
        { error: "Access denied: Freelancers only" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // 'assigned', 'bids', 'available'

    if (type === 'assigned') {
      // Get projects assigned to this freelancer
      const assignedProjects = await PostJob.find({
        assignedTo: decoded._id
      })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

      return NextResponse.json({ projects: assignedProjects }, { status: 200 });
    }

    if (type === 'bids') {
      // Get all bids made by this freelancer
      const bids = await Bid.find({ freelancerId: decoded._id })
        .populate({
          path: 'jobId',
          populate: {
            path: 'userId',
            select: 'name profileImage'
          }
        })
        .sort({ createdAt: -1 });

      return NextResponse.json({ bids }, { status: 200 });
    }

    if (type === 'available') {
      // Get available jobs that match freelancer's skills
      const availableJobs = await PostJob.find({
        status: 'open',
        skills: { $in: user.skills || [] }
      })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

      // Check which jobs the freelancer has already bid on
      const jobIds = availableJobs.map(job => job._id);
      const existingBids = await Bid.find({
        freelancerId: decoded._id,
        jobId: { $in: jobIds }
      });

      const bidJobIds = existingBids.map(bid => bid.jobId.toString());
      
      const jobsWithBidStatus = availableJobs.map(job => ({
        ...job.toObject(),
        hasBid: bidJobIds.includes(job._id.toString())
      }));

      return NextResponse.json({ jobs: jobsWithBidStatus }, { status: 200 });
    }

    // Default: return all data
    const [assignedProjects, bids, availableJobs] = await Promise.all([
      PostJob.find({ assignedTo: decoded._id })
        .populate('userId', 'name profileImage')
        .sort({ createdAt: -1 }),
      
      Bid.find({ freelancerId: decoded._id })
        .populate({
          path: 'jobId',
          populate: {
            path: 'userId',
            select: 'name profileImage'
          }
        })
        .sort({ createdAt: -1 }),
      
      PostJob.find({
        status: 'open',
        skills: { $in: user.skills || [] }
      })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(20)
    ]);

    return NextResponse.json({
      assignedProjects,
      bids,
      availableJobs
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching freelancer projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}