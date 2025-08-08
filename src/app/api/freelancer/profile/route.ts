import { connect } from '@/helper/db';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/models/userModel';
import cloudinary from '@/helper/cloudinary';

export async function GET(req: NextRequest) {
  await connect();

  const token = req.cookies.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    const user = await User.findById(decoded._id).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await connect();

  const token = req.cookies.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    const formData = await req.formData();

    const updateData: any = {
      name: formData.get('name'),
      bio: formData.get('bio'),
      hourlyRate: Number(formData.get('hourlyRate')),
      skills: JSON.parse(formData.get('skills') as string)
    };

    // Handle image upload
    const profileImage = formData.get('profileImage') as File;
    if (profileImage) {
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Convert buffer to base64
      const base64Image = buffer.toString('base64');
      const dataURI = `data:${profileImage.type};base64,${base64Image}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'freelancer_profiles',
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      });

      updateData.profileImage = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded._id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}