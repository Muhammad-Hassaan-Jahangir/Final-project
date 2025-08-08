import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PostJob } from "@/models/postjobModel";
import { Notification } from "@/models/notificationModel";
import cloudinary from "@/helper/cloudinary";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();

  const token = req.cookies.get("token")?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    
    // Check content type to handle form data with file upload
    const contentType = req.headers.get("content-type") || "";
    let submissionFile = "";
    let completionNotes = "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      completionNotes = formData.get("completionNotes") as string || "";
      
      const file = formData.get("file") as File;
      
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        try {
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadOptions = {
              folder: "job_submissions",
              resource_type: "auto", // Allows any file type
              use_filename: true,
              unique_filename: true,
            };
            
            cloudinary.uploader.upload_stream(
              uploadOptions,
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(buffer);
          }) as any;
          
          submissionFile = uploadResult.secure_url;
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          return NextResponse.json(
            { error: "Failed to upload submission file" },
            { status: 500 }
          );
        }
      }
    } else {
      // Handle regular JSON request
      const body = await req.json();
      submissionFile = body.submissionFile || "";
      completionNotes = body.completionNotes || "";
    }

    // Find the job and verify freelancer ownership
    const job = await PostJob.findOne({
      _id: params.id,
      assignedTo: decoded._id,
      status: 'in_progress'
    }).populate('userId', 'name email');

    if (!job) {
      return NextResponse.json({ 
        error: "Job not found or not assigned to you" 
      }, { status: 404 });
    }

    // Update job status to completed
    const updatedJob = await PostJob.findByIdAndUpdate(params.id, {
      status: 'completed',
      submissionFile,
      completionNotes,
      completedAt: new Date(),
      clientConfirmed: false
    }, { new: true });

    // Create notification for client
    const notification = new Notification({
      userId: job.userId._id,
      type: 'project_completed',
      title: 'Project Completed',
      message: `"${job.title}" has been completed by the freelancer. Please review and confirm the delivery.`,
      relatedId: job._id,
      relatedModel: 'PostJob'
    });
    
    await notification.save();

    return NextResponse.json({ 
      message: "Job marked as completed successfully",
      job: updatedJob
    });
  } catch (error) {
    console.error('Error completing job:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}