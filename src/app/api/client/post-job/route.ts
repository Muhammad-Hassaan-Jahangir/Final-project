import { NextRequest, NextResponse } from "next/server";
import { connect } from "../../../../helper/db";
import { PostJob } from "../../../../models/postjobModel";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import cloudinary from "@/helper/cloudinary";

export async function POST(req: NextRequest) {
  await connect();
  const contentType = req.headers.get("content-type") || "";
  let jobData: any = {};
  let imageUrl = "";
  let attachments: string[] = [];

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Authentication token or JWT secret missing" },
      { status: 401 }
    );
  }
  const data = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: mongoose.Types.ObjectId, name: string, role: string };

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    jobData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      subcategory: formData.get("subcategory"),
      skills: formData.get("skills") ? (formData.get("skills") as string).split(",") : [],
      jobType: formData.get("jobType"),
      basicBudget: parseFloat(formData.get("basicBudget") as string) || 0,
      expertBudget: parseFloat(formData.get("expertBudget") as string) || 0,
      deadline: formData.get("deadline"),
      additionalRequirements: formData.get("additionalRequirements"),
    };
    // Handle image (optional)
    const imageFile = formData.get("image") as File;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "project_images" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }).end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    }
    // Handle attachments (can be multiple)
    const files = formData.getAll("attachments");
    for (const file of files) {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: "job_attachments" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }).end(buffer);
        });
        attachments.push(uploadResult.secure_url);
      }
    }
  } else {
    jobData = await req.json();
    imageUrl = jobData.image || "";
    attachments = jobData.attachments || [];
  }

  try {
    // Calculate the budget as the average of basicBudget and expertBudget
    const budget = (jobData.basicBudget + jobData.expertBudget) / 2;
    
    const newJob = new PostJob({
      ...jobData,
      budget: budget, // Set the main budget field
      deadline: new Date(jobData.deadline),
      userId: data._id,
      image: imageUrl,
      attachments,
    });
    await newJob.save();
    return NextResponse.json({ 
      message: "Job posted successfully",
      jobId: newJob._id.toString()
    });
  } catch (error) {
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