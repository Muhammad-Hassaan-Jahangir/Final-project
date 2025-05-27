
import next from "next";
import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/helper/db";
import {User} from "../../../models/userModel";
import bcrypt from "bcryptjs";

connect();
console.log("Connected to database");
export async function GET(request: NextRequest) {

   let users:any=[];
   try{
    users =await User.find();

   }catch(err){
       console.log("Error in getting users",err);
   }
    return NextResponse.json(users);
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