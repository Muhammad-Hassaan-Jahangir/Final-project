import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/helper/db';
import { User } from '@/models/userModel';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();

  try {
    const { id } = params;
    
    // Fetch the freelancer by ID
    const freelancer = await User.findOne({
      _id: id,
      role: 'freelancer'
    }).select('-password -favoriteJobs -transactionHistory');
    
    if (!freelancer) {
      return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 });
    }
    
    return NextResponse.json({ freelancer }, { status: 200 });
  } catch (error) {
    console.error('Error fetching freelancer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freelancer profile' },
      { status: 500 }
    );
  }
}