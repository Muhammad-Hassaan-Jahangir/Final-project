'use client';

import { useState, useEffect } from 'react';
import Chat from '@/components/Chat';
import axios from 'axios';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const params = useParams();
  const receiverId = params.receiverId; // receiverId from URL
  const [currentUserId, setCurrentUserId] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const [otherUserProfileImage, setOtherUserProfileImage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!receiverId) return; // Guard: do not fetch if undefined

      try {
        const userRes = await axios.get('/api/auth/me', { withCredentials: true });
        const currentUser = userRes.data.user;
        setCurrentUserId(currentUser._id);

        const receiverRes = await axios.get(`/api/user/${receiverId}`, { withCredentials: true });
        setOtherUserName(receiverRes.data.name);
        setOtherUserProfileImage(receiverRes.data.profileImage || '');

      } catch (error) {
        console.error('Failed to fetch user data', error);
        if (axios.isAxiosError(error)) {
          console.error('Response status:', error.response?.status);
          console.error('Response data:', error.response?.data);
        }
      }
    };

    fetchData();
  }, [receiverId]);

  if (!currentUserId || !receiverId) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <Chat
        currentUserId={currentUserId}
        otherUserId={receiverId as string}
        otherUserName={otherUserName}
        otherUserProfileImage={otherUserProfileImage}
      />
    </div>
  );
}
