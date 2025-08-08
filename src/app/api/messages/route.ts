import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/helper/db';
import { Message } from '@/models/messageModel';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import cloudinary from '@/helper/cloudinary';

// POST endpoint to create a new message
export async function POST(req: NextRequest) {
  // Get token and JWT secret before attempting database connection
  const token = req.cookies.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Connect to database
    await connect();
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    const currentUserId = decoded._id;

    const contentType = req.headers.get('content-type') || '';
    let receiverId, content, attachments = [];
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file uploads
      const formData = await req.formData();
      receiverId = formData.get('receiverId') as string;
      content = formData.get('content') as string;
      
      // Process file attachments
      const files = formData.getAll('files') as File[];
      
      for (const file of files) {
        if (file && file.size > 0) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          try {
            const uploadResult = await new Promise((resolve, reject) => {
              const uploadOptions: any = {
                folder: 'chat_attachments',
                resource_type: 'auto', // Allows any file type
                use_filename: true,
                unique_filename: true,
              };
              
              // Special handling for PDF files
              if (file.type === 'application/pdf') {
                uploadOptions.resource_type = 'raw';
                uploadOptions.public_id = `pdf_${Date.now()}_${file.name.replace(/\.[^/.]+$/, '')}`;
                uploadOptions.access_mode = 'public';
                uploadOptions.type = 'upload';
                uploadOptions.invalidate = true;
                uploadOptions.context = {
                  'content-type': 'application/pdf',
                  'content-disposition': 'inline'
                };
              }
              
              cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(buffer);
            }) as any;
            
            attachments.push({
              url: uploadResult.secure_url,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            });
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload file: ' + file.name },
              { status: 500 }
            );
          }
        }
      }
    } else {
      // Handle regular JSON messages
      const body = await req.json();
      receiverId = body.receiverId;
      content = body.content;
    }
    
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
        { status: 400 }
      );
    }
    
    // Validate IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Create and save the new message
    const message = new Message({
      senderId: currentUserId,
      receiverId,
      content,
      attachments,
      timestamp: new Date(),
    });

    await message.save();

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error creating message:', error); console.error('Error details:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error && error.stack ? error.stack : '');
    
    // Handle specific error types
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    if (error instanceof mongoose.Error) {
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}