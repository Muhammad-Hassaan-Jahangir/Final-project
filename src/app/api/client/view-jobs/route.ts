import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/helper/db";
import { PostJob } from "@/models/postjobModel";
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
    console.log("Decoded token:", decoded);

    const jobs = await PostJob.find({ userId: decoded._id });
    console.log("Fetched jobs:", jobs);

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posted jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
