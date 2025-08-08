'use client';

import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

interface Attachment {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface Message {
  _id: string;
  content: string;
  senderId: string;
  timestamp: string;
  attachments?: Attachment[];
}

interface ChatProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserProfileImage?: string;
}

export default function Chat({ currentUserId, otherUserId, otherUserName, otherUserProfileImage }: ChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roomId =
    currentUserId < otherUserId
      ? `${currentUserId}-${otherUserId}`
      : `${otherUserId}-${currentUserId}`;

  useEffect(() => {
    const initSocket = async () => {
      try {
        // Connect to the socket server (now handled by custom server)
        const socketIo = io(window.location.origin, {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          autoConnect: true,
        });
        
        setSocket(socketIo);

        // Join the room for this conversation
        socketIo.emit('join-room', roomId);
        console.log('Joined room:', roomId);

        // Listen for new messages - use a ref to prevent duplicates
        const handleReceiveMessage = (message: Message) => {
          console.log('Received message:', message);
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(m => m._id === message._id);
            if (messageExists) {
              console.log('Message already exists, skipping duplicate');
              return prev;
            }
            return [...prev, message];
          });
        };

        socketIo.on('receive-message', handleReceiveMessage);

        // Handle connection errors
        socketIo.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

        return () => {
          socketIo.off('receive-message', handleReceiveMessage);
          socketIo.disconnect();
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    const cleanup = initSocket();
    
    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, [roomId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Validate otherUserId before making the request
        if (!otherUserId || otherUserId.trim() === '') {
          console.error('Invalid otherUserId');
          setMessages([]);
          return;
        }

        // Use the correct API endpoint with the fixed route parameter name
        const res = await axios.get(`/api/messages/${otherUserId}`, {
          withCredentials: true,
        });
        
        if (res.data && res.data.messages) {
          setMessages(res.data.messages);
        } else {
          console.warn('No messages returned from API');
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response status:', error.response?.status);
          console.error('Response data:', error.response?.data);
        }
        // Set empty array on error to avoid undefined messages
        setMessages([]);
      }
    };

    if (otherUserId) {
      fetchMessages();
    }
  }, [otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    return '📎';
  };

  const sendMessage = async () => {
    if ((newMessage.trim() || selectedFiles.length > 0) && socket) {
      try {
        // Validate otherUserId before sending
        if (!otherUserId || otherUserId.trim() === '') {
          console.error('Invalid receiverId');
          return;
        }
        
        setUploading(true);
        
        // Store the message content and files before clearing
        const messageContent = newMessage || (selectedFiles.length > 0 ? 'Shared files' : '');
        const filesToSend = [...selectedFiles];
        
        // Clear input fields immediately
        setNewMessage('');
        setSelectedFiles([]);
        
        if (filesToSend.length > 0) {
          // Send message with files via API
          const formData = new FormData();
          formData.append('receiverId', otherUserId);
          formData.append('content', messageContent);
          
          filesToSend.forEach(file => {
            formData.append('files', file);
          });
          
          try {
            const response = await fetch('/api/messages', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              throw new Error('Failed to send message with files');
            }
            
            const result = await response.json();
            console.log('Message with files sent successfully');
            
            // Emit via socket for real-time delivery
            if (result.message) {
              socket.emit('send-message', {
                senderId: currentUserId,
                receiverId: otherUserId,
                content: result.message.content,
                attachments: result.message.attachments,
              });
            }
          } catch (error) {
            console.error('Error sending message with files:', error);
            // Restore the message and files on error
            setNewMessage(messageContent);
            setSelectedFiles(filesToSend);
          }
        } else {
          // Send text-only message via socket
          const messageData = {
            senderId: currentUserId,
            receiverId: otherUserId,
            content: messageContent,
            attachments: [],
          };
          
          socket.emit('send-message', messageData);
          
          // Set a timeout to check if the message was delivered via socket
          const messageDeliveryTimeout = setTimeout(async () => {
            try {
              // If socket delivery fails, use API as fallback
              const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  receiverId: otherUserId,
                  content: messageContent,
                }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to send message via API');
              }
              
              console.log('Message sent via API fallback');
            } catch (fallbackError) {
              console.error('Fallback API also failed:', fallbackError);
            }
          }, 5000);
          
          // Clear the timeout if socket.io confirms delivery
          socket.once('receive-message', (message) => {
            if (message.content === messageContent && message.senderId === currentUserId) {
              clearTimeout(messageDeliveryTimeout);
            }
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-white border-opacity-30">
          <img 
            src={otherUserProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserName)}&background=6d28d9&color=ffffff`} 
            alt={otherUserName} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserName)}&background=6d28d9&color=ffffff`;
            }}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{otherUserName}</h2>
          <p className="text-sm text-blue-100">Online</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex items-end space-x-2 ${
              message.senderId === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Avatar for received messages */}
            {message.senderId !== currentUserId && (
              <div className="w-8 h-8 rounded-full overflow-hidden mb-1">
                {otherUserProfileImage ? (
                  <img 
                    src={otherUserProfileImage} 
                    alt={otherUserName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium ${otherUserProfileImage ? 'hidden' : ''}`}>
                  {otherUserName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                message.senderId === currentUserId
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {/* Display attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-xl border ${
                        message.senderId === currentUserId
                          ? 'border-blue-300 bg-blue-400 bg-opacity-20'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{getFileIcon(attachment.fileType)}</span>
                      <div className="flex-1 min-w-0">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block truncate hover:underline font-medium ${
                            message.senderId === currentUserId
                              ? 'text-white'
                              : 'text-blue-600'
                          }`}
                          onClick={(e) => {
                             if (attachment.fileType === 'application/pdf') {
                               e.preventDefault();
                               // Direct PDF viewing
                               window.open(attachment.url + '#view=FitH&toolbar=1', '_blank', 'noopener,noreferrer');
                             }
                           }}
                        >
                          {attachment.fileName}
                        </a>
                        {/* Add view button for PDFs */}
                        {attachment.fileType === 'application/pdf' && (
                          <div className="flex gap-2 mt-2">
                            <button
                                 onClick={() => {
                                   // Create inline PDF viewer
                                   // Direct PDF viewing with proper URL handling
                                    window.open(attachment.url + '#view=FitH&toolbar=1', '_blank', 'noopener,noreferrer');
                                 }}
                              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                message.senderId === currentUserId
                                  ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              View PDF
                            </button>
                            <a
                              href={attachment.url}
                              download={attachment.fileName}
                              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                message.senderId === currentUserId
                                  ? 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Download
                            </a>
                          </div>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.senderId === currentUserId
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}>
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <p className={`text-xs mt-2 ${
                message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            {/* Avatar for sent messages */}
            {message.senderId === currentUserId && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mb-1">
                You
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200 bg-white">
        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Selected Files ({selectedFiles.length})</h4>
              <button
                onClick={() => setSelectedFiles([])}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-xl">{getFileIcon(file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Message Input */}
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              disabled={uploading}
            />
            
            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            
            {/* Attach Files Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach Files"
            >
              📎
            </button>
          </div>
          
          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={uploading || (!newMessage.trim() && selectedFiles.length === 0)}
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-lg"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
