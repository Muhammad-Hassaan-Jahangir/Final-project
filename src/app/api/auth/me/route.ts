import { connect } from "@/helper/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/userModel";

export async function GET(req: NextRequest) {
  await connect();

  const token = req.cookies.get("token")?.value;
  const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';

  if (!token || !jwtSecret) {
    console.error('Missing token or JWT secret in /api/auth/me:', { hasToken: !!token, hasJwtSecret: !!jwtSecret });
    return NextResponse.json({ error: "Unauthorized access: Missing token or JWT secret" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    console.log('Authenticated user ID:', decoded._id);

    const user = await User.findById(decoded._id).select("name email role");

    if (!user) {
      console.error('User not found for ID:', decoded._id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('User found:', { id: user._id, name: user.name, role: user.role });
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("Error in /auth/me:", err);
    console.error('Error details:', err instanceof Error ? err.message : 'Unknown error', 
                err instanceof Error && err.stack ? err.stack : '');
    
    // Handle specific error types
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Unauthorized access: Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
