import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { User } from "@/models/userModel";
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
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      walletAddress: user.walletAddress || "",
    }, { status: 200 });
  } catch (error) {
    console.error("Error getting user wallet address:", error);
    return NextResponse.json(
      { error: "Failed to get user wallet address" },
      { status: 500 }
    );
  }
}

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
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      decoded._id,
      { walletAddress },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Wallet address updated successfully",
      walletAddress: user.walletAddress,
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating user wallet address:", error);
    return NextResponse.json(
      { error: "Failed to update user wallet address" },
      { status: 500 }
    );
  }
}