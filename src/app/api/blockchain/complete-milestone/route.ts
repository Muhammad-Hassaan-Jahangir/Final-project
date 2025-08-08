import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import jwt from "jsonwebtoken";
import { completeMilestone } from "@/services/blockchainService";

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
    const { milestoneId } = await req.json();

    if (!milestoneId) {
      return NextResponse.json(
        { error: "Milestone ID is required" },
        { status: 400 }
      );
    }

    // Complete milestone on blockchain
    const result = await completeMilestone(milestoneId);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Failed to complete milestone on blockchain", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error completing blockchain milestone:", error);
    return NextResponse.json(
      { error: "Failed to complete blockchain milestone" },
      { status: 500 }
    );
  }
}