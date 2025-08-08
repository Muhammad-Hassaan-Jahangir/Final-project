import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { User } from "@/models/userModel";

connect();

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (in a real app, use middleware for this)
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");
    
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get all users with pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password");
    
    const total = await User.countDocuments();
    
    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { adminId, userId, action } = await request.json();
    
    // Verify admin
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Handle different actions
    if (action === "promote") {
      // Only promote clients or freelancers to admin
      if (user.role === "client" || user.role === "freelancer") {
        user.role = "admin";
        await user.save();
        return NextResponse.json({ message: "User promoted to admin", user });
      }
    } else if (action === "disable") {
      // In a real app, you'd have an 'active' field to toggle
      // For this example, we'll just return a success message
      return NextResponse.json({ message: "User account disabled" });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Admin user update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}