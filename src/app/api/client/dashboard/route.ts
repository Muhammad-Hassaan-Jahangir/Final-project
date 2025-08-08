import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { User } from "@/models/userModel";
import { PostJob } from "@/models/postjobModel";
import { Bid } from "@/models/bidModel";
import { Review } from "@/models/reviewModel";
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
    
    // Verify user is a client
    const user = await User.findById(decoded._id);
    if (!user || user.role !== 'client') {
      return NextResponse.json(
        { error: "Access denied: Clients only" },
        { status: 403 }
      );
    }

    // Get all client's projects
    const allProjects = await PostJob.find({ userId: decoded._id })
      .populate('assignedTo', 'name profileImage hourlyRate')
      .sort({ createdAt: -1 });

    // Categorize projects by status
    const openProjects = allProjects.filter(p => p.status === 'pending');
    const activeProjects = allProjects.filter(p => p.status === 'in_progress');
    const completedProjects = allProjects.filter(p => p.status === 'completed');
    const cancelledProjects = allProjects.filter(p => p.status === 'cancelled');

    // Get total bids received for all projects
    const projectIds = allProjects.map(p => p._id);
    const totalBids = await Bid.countDocuments({ jobId: { $in: projectIds } });

    // Get recent bids for open projects
    const recentBids = await Bid.find({ 
      jobId: { $in: openProjects.map(p => p._id) },
      status: 'pending'
    })
    .populate('freelancerId', 'name profileImage hourlyRate skills')
    .populate('jobId', 'title budget')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get reviews given by client
    const reviewsGiven = await Review.find({
      reviewerId: decoded._id
    })
    .populate('revieweeId', 'name profileImage')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get reviews received by client
    const reviewsReceived = await Review.find({
      revieweeId: decoded._id
    })
    .populate('reviewerId', 'name profileImage')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

    // Calculate average rating received
    const avgRating = reviewsReceived.length > 0 
      ? reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / reviewsReceived.length 
      : 0;

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      userId: decoded._id,
      isRead: false
    });

    // Calculate total spent on completed projects
    const totalSpent = completedProjects.reduce((sum, project) => {
      return sum + (project.budget || 0);
    }, 0);

    // Get projects needing attention (completed but not confirmed)
    const projectsNeedingAttention = allProjects.filter(p => 
      p.status === 'completed' && !p.clientConfirmed
    );

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        badges: user.badges
      },
      stats: {
        totalProjects: allProjects.length,
        openProjects: openProjects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        totalBidsReceived: totalBids,
        totalSpent,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviewsReceived.length,
        unreadNotifications,
        projectsNeedingAttention: projectsNeedingAttention.length
      },
      recentData: {
        recentProjects: allProjects.slice(0, 5),
        recentBids,
        projectsNeedingAttention,
        recentReviews: reviewsReceived
      },
      projectBreakdown: {
        pending: openProjects.length,
        inProgress: activeProjects.length,
        completed: completedProjects.length,
        cancelled: cancelledProjects.length
      }
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Error fetching client dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}