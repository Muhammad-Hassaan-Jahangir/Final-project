import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import jwt from "jsonwebtoken";
import { getMilestoneDetails } from "@/services/blockchainService";

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
    const milestoneId = url.searchParams.get("milestoneId");

    if (!milestoneId) {
      return NextResponse.json(
        { error: "Milestone ID is required" },
        { status: 400 }
      );
    }

    // Get milestone details from blockchain
    const result = await getMilestoneDetails(milestoneId);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Failed to get milestone details from blockchain", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error getting blockchain milestone details:", error);
    return NextResponse.json(
      { error: "Failed to get blockchain milestone details" },
      { status: 500 }
    );
  }
}