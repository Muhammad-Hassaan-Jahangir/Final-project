'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';

type Contact = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
  lastMessage: {
    content: string;
    timestamp: string;
    isFromCurrentUser: boolean;
  } | null;
};

export default function ClientMessages() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ _id: string; name: string } | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current user info
        const userRes = await axios.get('/api/auth/me', { withCredentials: true });
        setCurrentUser(userRes.data.user);
        
        // Fetch contacts
        const contactsRes = await axios.get('/api/messages/contacts', { withCredentials: true });
        setContacts(contactsRes.data.contacts || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response status:', error.response?.status);
          console.error('Response data:', error.response?.data);
        }
        setError('Failed to load messages');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTimeString = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Users List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <p className="text-sm text-blue-100">Chat with your contacts</p>
        </div>
        
        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : contacts.length === 0 ? (
            <div className="text-center p-6">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">No conversations yet</p>
              <button 
                onClick={() => router.push('/client/find-freelancers')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Find Freelancers
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => setSelectedContact(contact)}
                  className={`flex items-center p-4 hover:bg-blue-50 transition-colors cursor-pointer ${
                    selectedContact?._id === contact._id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {contact.profileImage ? (
                        <img 
                          src={contact.profileImage} 
                          alt={contact.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-lg">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {getTimeString(contact.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 truncate">
                      {contact.lastMessage ? (
                        <>
                          {contact.lastMessage.isFromCurrentUser && <span className="text-gray-400">You: </span>}
                          {contact.lastMessage.content}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No messages yet</span>
                      )}
                    </p>
                    
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        contact.role === 'freelancer' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {contact.role === 'freelancer' ? 'Freelancer' : 'Client'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact && currentUser ? (
          <Chat
             currentUserId={currentUser._id}
             otherUserId={selectedContact._id}
             otherUserName={selectedContact.name}
             otherUserProfileImage={selectedContact.profileImage}
           />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a contact from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}