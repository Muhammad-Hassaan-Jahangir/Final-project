import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/helper/db';
import { User } from '@/models/userModel';

export async function GET(req: NextRequest) {
  await connect();

  try {
    // Fetch all users with role='freelancer'
    const freelancers = await User.find({
      role: 'freelancer'
    }).select('-password -favoriteJobs -transactionHistory');
    
    console.log('Fetched freelancers:', freelancers.length);

    return NextResponse.json({ freelancers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freelancers' },
      { status: 500 }
    );
  }
}