import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { Message } from '@/models/messageModel';
import { connect } from '@/helper/db';

const SocketHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('join-room', (jobId: string) => {
        socket.join(jobId);
        console.log(`Client joined room: ${jobId}`);
      });

      socket.on('send-message', async (data) => {
        try {
          await connect();
          const message = new Message({
            jobId: data.jobId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content
          });
          await message.save();
          
          io.to(data.jobId).emit('receive-message', message);
        } catch (error) {
          console.error('Error saving message:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  res.end();
};

export default SocketHandler;