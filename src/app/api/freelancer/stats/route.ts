import { connect } from '@/helper/db';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PostJob } from '@/models/postjobModel';
import { Review } from '@/models/reviewModel';
import { User } from '@/models/userModel';

export async function GET(req: NextRequest) {
  try {
    await connect();

    const token = req.cookies.get('token')?.value;
    const jwtSecret = process.env.JWT_SECRET;

    if (!token) {
      console.error('No token provided');
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    if (!jwtSecret) {
      console.error('JWT secret not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { _id: string };
      
      if (!decoded || !decoded._id) {
        console.error('Invalid token payload');
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }

      // Verify user exists
      const user = await User.findById(decoded._id);
      if (!user) {
        console.error('User not found:', decoded._id);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (user.role !== 'freelancer') {
        console.error('User is not a freelancer:', decoded._id);
        return NextResponse.json({ error: 'Access denied: Freelancers only' }, { status: 403 });
      }

      const [completed, active, completedProjects, reviewsCount] = await Promise.all([
        PostJob.countDocuments({ assignedTo: decoded._id, status: 'completed' }),
        PostJob.countDocuments({ assignedTo: decoded._id, status: { $in: ['in_progress', 'under_review'] } }),
        PostJob.find({ assignedTo: decoded._id, status: 'completed' }),
        Review.countDocuments({ revieweeId: decoded._id, reviewType: 'client_to_freelancer' })
      ]);
      
      // Calculate total earnings from completed projects
      const totalEarnings = completedProjects.reduce((sum, project) => {
        // Use the project budget or calculate from basicBudget and expertBudget if available
        const projectBudget = project.budget || 
          ((project.basicBudget && project.expertBudget) ? 
            (project.basicBudget + project.expertBudget) / 2 : 
            (project.basicBudget || project.expertBudget || 0));
        return sum + projectBudget;
      }, 0);

      return NextResponse.json({
        completed,
        active,
        reviews: reviewsCount, // Actual count of client reviews
        totalEarnings: totalEarnings
      });
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
    return NextResponse.json({ error: 'Failed to fetch stats: ' + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
}