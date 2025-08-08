import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Review } from "@/models/reviewModel";
import { User } from "@/models/userModel";
import { PostJob } from "@/models/postjobModel";
import jwt from "jsonwebtoken";

// Get reviews for a user
export async function GET(req: NextRequest) {
  await connect();

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const type = url.searchParams.get("type"); // 'received' or 'given'

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    let reviews;
    if (type === 'given') {
      reviews = await Review.find({ reviewerId: userId })
        .populate('revieweeId', 'name profileImage')
        .populate('projectId', 'title')
        .sort({ createdAt: -1 });
    } else {
      // Default to received reviews
      reviews = await Review.find({ revieweeId: userId })
        .populate('reviewerId', 'name profileImage')
        .populate('projectId', 'title')
        .sort({ createdAt: -1 });
    }

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return NextResponse.json({ 
      reviews, 
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// Create a new review
export async function POST(req: NextRequest) {
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
    const body = await req.json();
    const { projectId, revieweeId, rating, comment, skills, reviewType } = body;

    if (!projectId || !revieweeId || !rating || !comment || !reviewType) {
      return NextResponse.json(
        { error: "Project ID, reviewee ID, rating, comment, and review type are required" },
        { status: 400 }
      );
    }

    // Verify the project exists and the reviewer is involved
    const project = await PostJob.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if reviewer is either the client or assigned freelancer
    const isClient = project.userId.toString() === decoded._id;
    const isFreelancer = project.assignedTo?.toString() === decoded._id;
    
    if (!isClient && !isFreelancer) {
      return NextResponse.json(
        { error: "You are not authorized to review this project" },
        { status: 403 }
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      projectId,
      reviewerId: decoded._id,
      revieweeId
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this user for this project" },
        { status: 400 }
      );
    }

    const newReview = new Review({
      projectId,
      reviewerId: decoded._id,
      revieweeId,
      rating,
      comment,
      reviewType,
      skills: skills || []
    });

    await newReview.save();

    const populatedReview = await Review.findById(newReview._id)
      .populate('reviewerId', 'name profileImage')
      .populate('revieweeId', 'name profileImage')
      .populate('projectId', 'title');

    return NextResponse.json({ review: populatedReview }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}