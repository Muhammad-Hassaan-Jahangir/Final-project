import {User} from "../../../models/userModel";
import { NextResponse,NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import next from "next";
import {connect} from "@/helper/db";
connect();
export async function POST(request: NextRequest) {
    const {email, password,role} = await request.json();
    console.log("email", email);
    console.log("password", password);
    const user = await User.findOne({
        email: email,
        role: role,
      });
      if(user==null){
        return NextResponse.json({ message: "User not found", status: false }, { status: 404, statusText: "statustext" });
      }
      const isMatch = await bcrypt.compareSync(password,user.password);
      if(!isMatch){
        return NextResponse.json({ message: "Password not matched", status: false }, { status: 404, statusText: "statustext" });
      }
        const token = await jwt.sign({ _id: user._id , name:user.name , role:user.role}, process.env.JWT_SECRET as string, {
            expiresIn: "1d",
        });
        console.log("token", token);
      console.log("user", user);
    console.log("Post api called")
    const response = NextResponse.json({
  message: "Login successful",
  status: true,
  user: {
    _id: user._id, // ✅ add this
    name: user.name,
    email: user.email,
    role: user.role,
    token: token,
  },
}, { status: 200 });

response.cookies.set("token", token, {
  httpOnly: true,
  maxAge: 60 * 60 * 24,
});

return response;

}