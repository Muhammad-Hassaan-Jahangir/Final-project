import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/helper/db';
import { Message } from '@/models/messageModel';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { otherUserId: string } }
) {
  await connect();

  const token = req.cookies.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';

  if (!token || !jwtSecret) {
    console.error('Missing token or JWT secret:', { hasToken: !!token, hasJwtSecret: !!jwtSecret });
    return NextResponse.json({ error: 'Unauthorized access: Missing token or JWT secret' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    const currentUserId = decoded._id;
    const otherUserId = params.otherUserId;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      console.error('Invalid user IDs:', { currentUserId, otherUserId });
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    console.log('Fetching messages between users:', { currentUserId, otherUserId });

    // Find all messages between currentUser and otherUser
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    })
      .sort({ timestamp: 1 })
      .populate('senderId', 'name');

    console.log('Found messages:', messages.length);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages in /api/messages/[otherUserId]:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error', 
                error instanceof Error && error.stack ? error.stack : '');
    
    // Handle specific error types
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Unauthorized access: Invalid token' }, { status: 401 });
    }
    
    if (error instanceof mongoose.Error) {
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error: Failed to fetch messages' },
      { status: 500 }
    );
  }
}
