import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/helper/db';
import { Message } from '@/models/messageModel';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { receiverId: string } }
) {
  // Get token and JWT secret before attempting database connection
  const token = req.cookies.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;
  
  // Check authentication first
  if (!token || !jwtSecret) {
    return NextResponse.json({ error: 'Unauthorized access: Missing token or JWT secret' }, { status: 401 });
  }
  
  try {
    // Connect to database
    await connect();
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };

    const currentUserId = decoded._id;
    const receiverId = params.receiverId;

    // Add validation for ObjectIDs
    if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Find messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: receiverId },
        { senderId: receiverId, receiverId: currentUserId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate('senderId', 'name');

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error', 
                error instanceof Error && error.stack ? error.stack : '');
    
    // Handle specific error types
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Unauthorized access: Invalid token' }, { status: 401 });
    }
    
    if (error instanceof mongoose.Error) {
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Internal server error: Failed to fetch messages' }, { status: 500 });
  }
}