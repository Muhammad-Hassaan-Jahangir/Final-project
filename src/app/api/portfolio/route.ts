import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { Portfolio } from "@/models/portfolioModel";
import { User } from "@/models/userModel";
import jwt from "jsonwebtoken";

// Get portfolio items
export async function GET(req: NextRequest) {
  await connect();

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const featured = url.searchParams.get("featured");
    const category = url.searchParams.get("category");

    let query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (category) {
      query.category = category;
    }

    const portfolios = await Portfolio.find(query)
      .populate('userId', 'name profileImage role')
      .sort({ featured: -1, createdAt: -1 });

    return NextResponse.json({ portfolios }, { status: 200 });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

// Create a new portfolio item
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
    
    // Verify user is a freelancer
    const user = await User.findById(decoded._id);
    if (!user || user.role !== 'freelancer') {
      return NextResponse.json(
        { error: "Only freelancers can create portfolio items" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { 
      title, 
      description, 
      category, 
      technologies, 
      images, 
      projectUrl, 
      githubUrl, 
      completedAt, 
      featured 
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      );
    }

    const newPortfolio = new Portfolio({
      userId: decoded._id,
      title,
      description,
      category,
      technologies: technologies || [],
      images: images || [],
      projectUrl: projectUrl || '',
      githubUrl: githubUrl || '',
      completedAt: completedAt || new Date(),
      featured: featured || false
    });

    await newPortfolio.save();

    const populatedPortfolio = await Portfolio.findById(newPortfolio._id)
      .populate('userId', 'name profileImage role');

    return NextResponse.json({ portfolio: populatedPortfolio }, { status: 201 });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    return NextResponse.json(
      { error: "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}

// Update portfolio item
export async function PUT(req: NextRequest) {
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
    const { portfolioId, ...updateData } = body;

    if (!portfolioId) {
      return NextResponse.json(
        { error: "Portfolio ID is required" },
        { status: 400 }
      );
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: portfolioId, userId: decoded._id },
      updateData,
      { new: true }
    ).populate('userId', 'name profileImage role');

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio item not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ portfolio }, { status: 200 });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

// Delete portfolio item
export async function DELETE(req: NextRequest) {
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
    const url = new URL(req.url);
    const portfolioId = url.searchParams.get("portfolioId");

    if (!portfolioId) {
      return NextResponse.json(
        { error: "Portfolio ID is required" },
        { status: 400 }
      );
    }

    const portfolio = await Portfolio.findOneAndDelete({
      _id: portfolioId,
      userId: decoded._id
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio item not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Portfolio item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}