import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { User } from "@/models/userModel";
import { PostJob } from "@/models/postjobModel";
import { Bid } from "@/models/bidModel";
import { Review } from "@/models/reviewModel";
import { Portfolio } from "@/models/portfolioModel";
import { Notification } from "@/models/notificationModel";
import jwt from "jsonwebtoken";

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

    // Get active projects
    const activeProjects = await PostJob.find({
      assignedTo: decoded._id,
      status: { $in: ['in_progress', 'under_review'] }
    }).populate('userId', 'name profileImage');

    // Get completed projects
    const completedProjects = await PostJob.find({
      assignedTo: decoded._id,
      status: 'completed'
    }).populate('userId', 'name profileImage');

    // Get pending bids
    const pendingBids = await Bid.find({
      freelancerId: decoded._id,
      status: 'pending'
    }).populate('jobId', 'title budget deadline');

    // Get accepted bids
    const acceptedBids = await Bid.find({
      freelancerId: decoded._id,
      status: 'accepted'
    }).populate('jobId', 'title budget deadline');

    // Get recent reviews
    const reviews = await Review.find({
      revieweeId: decoded._id
    })
    .populate('reviewerId', 'name profileImage')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Get portfolio count
    const portfolioCount = await Portfolio.countDocuments({ userId: decoded._id });

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      userId: decoded._id,
      isRead: false
    });

    // Calculate total earnings from completed projects
    const totalEarnings = completedProjects.reduce((sum, project) => {
      // Use the project budget or calculate from basicBudget and expertBudget if available
      const projectBudget = project.budget || 
        ((project.basicBudget && project.expertBudget) ? 
          (project.basicBudget + project.expertBudget) / 2 : 
          (project.basicBudget || project.expertBudget || 0));
      return sum + projectBudget;
    }, 0);

    // Get available jobs (open jobs that match freelancer's skills)
    const availableJobs = await PostJob.find({
      status: 'open',
      skills: { $in: user.skills || [] }
    })
    .populate('userId', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(10);

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        skills: user.skills,
        hourlyRate: user.hourlyRate,
        badges: user.badges
      },
      stats: {
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        pendingBids: pendingBids.length,
        totalEarnings,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
        portfolioItems: portfolioCount,
        unreadNotifications
      },
      recentData: {
        activeProjects: activeProjects.slice(0, 5),
        recentReviews: reviews,
        pendingBids: pendingBids.slice(0, 5),
        availableJobs
      }
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Error fetching freelancer dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}