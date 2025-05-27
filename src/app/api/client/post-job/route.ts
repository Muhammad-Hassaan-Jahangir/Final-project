import { NextRequest, NextResponse } from "next/server";
import { connect } from "../../../../helper/db";
import { PostJob } from "../../../../models/postjobModel";
import  jwt  from "jsonwebtoken";
import mongoose from "mongoose";
export async function POST(req: NextRequest) {
  await connect();
  const body = await req.json();

  const { title, description, budget, deadline } = body;
  console.log("Received job data:", body);
  const token = req.cookies.get("token")?.value;
  console.log("Auth token:", token);
  if (!token) {
    return NextResponse.json(
      { error: "Authentication token or JWT secret missing" },
      { status: 401 }
    );
  }
 const data = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: mongoose.Types.ObjectId, name: string, role: string };
   console.log(data._id);
  console.log("Decoded JWT data:", data);
console.log("User ID from JWT:", data._id)
try{
  const newJob = new PostJob({
    title: title,
    description: description,
    budget: budget,
    deadline: new Date(deadline),
    userId: data._id
    
, // Use the ID from the decoded JWT 
  });

  await newJob.save();

  return NextResponse.json({ message: "Job posted successfully" });
}
catch (error) {
  console.error("Error posting job:", error);
  return NextResponse.json(
    { error: "Failed to post job" },
    { status: 500 }
  );
}
}
export async function GET() {
  await connect();
  let jobs: any = [];
  try {
    jobs = await PostJob.find();
  } catch (err) {
    console.log("Error in getting jobs", err);
  }
  return NextResponse.json(jobs);
}