import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/helper/db';
import { Message } from '@/models/messageModel';
import { User } from '@/models/userModel';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  // Get token and JWT secret before attempting database connection
  const token = req.cookies.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';

  if (!token || !jwtSecret) {
    console.error('Missing token or JWT secret:', { hasToken: !!token, hasJwtSecret: !!jwtSecret });
    return NextResponse.json({ error: 'Unauthorized access: Missing token or JWT secret' }, { status: 401 });
  }
  
  try {
    // Connect to database
    await connect();
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    const currentUserId = decoded._id;
    
    // Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    console.log('Fetching contacts for user:', currentUserId);
    
    // Find all unique users that the current user has exchanged messages with
    const sentMessages = await Message.find({ senderId: currentUserId }).distinct('receiverId');
    const receivedMessages = await Message.find({ receiverId: currentUserId }).distinct('senderId');
    
    console.log('Sent messages to users:', sentMessages.length);
    console.log('Received messages from users:', receivedMessages.length);
    
    // Combine and remove duplicates
    const uniqueUserIds = [...new Set([...sentMessages, ...receivedMessages])];
    console.log('Unique contact user IDs:', uniqueUserIds.length);
    
    // Get user details for each contact
    const contacts = await User.find(
      { _id: { $in: uniqueUserIds } },
      { name: 1, email: 1, profileImage: 1, role: 1 }
    );

    // Filter out any contacts with invalid IDs
    const validContacts = contacts.filter(contact => 
      mongoose.Types.ObjectId.isValid(contact._id)
    );
    
    // For each contact, get the latest message
    const contactsWithLastMessage = await Promise.all(
      validContacts.map(async (contact) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: currentUserId, receiverId: contact._id },
            { senderId: contact._id, receiverId: currentUserId }
          ]
        }).sort({ timestamp: -1 }).limit(1);

        return {
          _id: contact._id,
          name: contact.name,
          email: contact.email,
          profileImage: contact.profileImage,
          role: contact.role,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            isFromCurrentUser: lastMessage.senderId.toString() === currentUserId
          } : null
        };
      })
    );

    // Sort by latest message timestamp
    contactsWithLastMessage.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

    console.log('Final contacts with last messages:', contactsWithLastMessage.length);
    console.log('Sample contact:', contactsWithLastMessage[0] || 'No contacts found');

    return NextResponse.json({ contacts: contactsWithLastMessage });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error', 
                error instanceof Error && error.stack ? error.stack : '');
    
    // Handle specific error types
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    if (error instanceof mongoose.Error) {
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}