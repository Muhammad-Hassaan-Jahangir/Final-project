import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import jwt from "jsonwebtoken";
import { createMilestone } from "@/services/blockchainService";

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
    const { freelancerAddress, description, amount } = await req.json();

    // Validate required fields
    if (!freelancerAddress || !description || !amount) {
      return NextResponse.json(
        { error: "Freelancer address, description, and amount are required" },
        { status: 400 }
      );
    }

    // Create milestone on blockchain
    const result = await createMilestone(freelancerAddress, description, amount);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(
        { error: "Failed to create milestone on blockchain", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating blockchain milestone:", error);
    return NextResponse.json(
      { error: "Failed to create blockchain milestone" },
      { status: 500 }
    );
  }
}