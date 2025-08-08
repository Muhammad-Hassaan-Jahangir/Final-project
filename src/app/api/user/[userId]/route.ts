import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import {User} from "@/models/userModel"; // Update this path to where your User model is defined
import cloudinary from '@/helper/cloudinary';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  // Validate userId is a valid ObjectId
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  let user = null;
  try {
    user = await User.findById(userId);
  } catch (err) {
    console.log("Error in getting user", err);
  }

  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
  const data = await request.json();
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true });
    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'profile_pictures' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }).end(buffer);
    });
    // @ts-ignore
    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
