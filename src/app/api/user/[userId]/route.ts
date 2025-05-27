
import next from "next";
import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/helper/db";
import {User} from "../../../../models/userModel";
import bcrypt from "bcryptjs";

connect();
console.log("Connected to database");
export async function GET(request: NextRequest,{ params }: { params: { userId: string } }) {
    const userId = params.userId; // Extract userId from the URL parameters

   let users:any=[];
   try{
    users =await User.findById(userId);

   }catch(err){
       console.log("Error in getting users",err);
   }
    return NextResponse.json(users);
}
