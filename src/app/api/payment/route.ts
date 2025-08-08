import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/helper/db';
import jwt from 'jsonwebtoken';
import { PostJob } from '@/models/postjobModel';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16' as const,
});

export async function POST(req: NextRequest) {
  await connect();
  
  const token = req.cookies.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the user is authenticated
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    
    // Parse the request body
    const { jobId, paymentMethodId } = await req.json();
    
    if (!jobId || !paymentMethodId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the job
    const job = await PostJob.findOne({ 
      _id: jobId, 
      userId: decoded._id,
      status: 'completed',
      clientConfirmed: false
    }).populate('assignedTo', 'name email');

    if (!job) {
      return NextResponse.json({ error: 'Job not found or not eligible for payment' }, { status: 404 });
    }

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(job.budget * 100), // Stripe requires amount in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Payment for job: ${job.title}`,
      metadata: {
        jobId: job._id.toString(),
        clientId: decoded._id,
        freelancerId: job.assignedTo._id.toString()
      },
    });

    // If payment is successful, update the job status
    if (paymentIntent.status === 'succeeded') {
      // Update job to mark as client confirmed
      await PostJob.findByIdAndUpdate(jobId, {
        clientConfirmed: true,
        paymentId: paymentIntent.id,
        paidAt: new Date()
      });

      return NextResponse.json({
        success: true,
        message: 'Payment successful',
        paymentIntent
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment processing',
        paymentIntent
      });
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json({ 
      error: error.message || 'Payment processing failed' 
    }, { status: 500 });
  }
}