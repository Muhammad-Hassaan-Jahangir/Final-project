import next from "next";
import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/helper/db";
import {User} from "../../../models/userModel";
import bcrypt from "bcryptjs";
import { PostJob } from "@/models/postjobModel";
import mongoose from "mongoose";

connect();
console.log("Connected to database");
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
  try {
    const user = await User.findById(userId).populate("favoriteJobs");
    const recentProjects = await PostJob.find({ userId }).sort({ deadline: -1 }).limit(5);
    // Example statistics
    const stats = {
      badges: user.badges || 0,
      favoriteJobs: user.favoriteJobs || [],
      transactionHistory: user.transactionHistory || [],
      year: new Date().getFullYear(),
    };
    return NextResponse.json({ user, stats, recentProjects });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
    
    //const body = request.body;
    //console.log("This is body",body) // This will log the userId from the URL
    //return NextResponse.json({message:"Post api called",status:true},{status:201,statusText:"statustext"});
    const {name,email,password,role} = await request.json();
    console.log("This is name",name) // This will log the userId from the URL
    console.log("This is email",email) // This will log the userId from the URL 
    console.log("This is password",password) // This will log the userId from the URL
    console.log("This is role",role) // This will log the userId from the URL
    
    // Check if trying to create an admin account
    if (role === "admin") {
        // Check if an admin already exists
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
            return NextResponse.json({
                message: "Only one admin account is allowed in the system",
                status: false
            }, { status: 403, statusText: "Forbidden" });
        }
    }
    
    const user = new User({
        name:name,
        email:email,
        password:password,
        role:role
    });
    try{
        user.password = await bcrypt.hash(user.password, process.env.SALT_ROUNDS || 10);
    const createdUser = await user.save();
    console.log("User created",createdUser);
    const response = NextResponse.json({
        message:"User Created",
        status:true},
        {status:201,
            statusText:"statustext"});
           
    return response;
}catch(err){
    console.log("Error in creating user",err);
    return NextResponse.json({message:"Error in creating user",status:false},{status:500,statusText:"statustext"});
}

}
export function PUT(){
    
}
export function DELETE(request: NextRequest){
    console.log("Delete api called")
    return NextResponse.json({message:"Delete api called",status:true},{status:201,statusText:"statustext"});
}