import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/helper/db';
import { Message } from '@/models/messageModel';
import jwt from 'jsonwebtoken';

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  await connect();

  const token = req.cookies.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    
    const messages = await Message.find({ jobId: params.jobId })
      .sort({ timestamp: 1 })
      .populate('senderId', 'name');

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}