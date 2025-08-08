import { connect } from '@/helper/db';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PostJob } from '@/models/postjobModel';
import { User } from '@/models/userModel';

export async function GET(req: NextRequest) {
  await connect();

  const token = req.cookies.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };

    const jobs = await PostJob.find({ 
      assignedTo: decoded._id, 
      status: 'in_progress' 
    })
    .populate('userId', 'name email profileImage')
    .sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err) {
    console.error('Error fetching accepted jobs:', err);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
