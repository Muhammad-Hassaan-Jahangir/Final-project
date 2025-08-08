const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3001;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Message model (simplified for server.js)
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  content: { type: String, required: true },
  attachments: [{
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true }
  }],
  timestamp: { type: Date, default: Date.now }
});

let Message;
try {
  Message = mongoose.model('Message');
} catch {
  Message = mongoose.model('Message', messageSchema);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fyp');
      console.log(' Connected to MongoDB');
    }
  } catch (error) {
    console.error(' MongoDB connection error:', error);
  }
};

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Connect to database
  connectDB();

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(` Client connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(` Client ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send-message', async (data) => {
      const { senderId, receiverId, content, attachments = [] } = data;

      try {
        await connectDB();

        const message = new Message({
          senderId,
          receiverId,
          content,
          attachments,
          timestamp: new Date(),
        });

        await message.save();
        console.log(' Message saved to database');

        // Create room ID (consistent with client-side logic)
        const roomId = [senderId, receiverId].sort().join('-');

        // Emit to all clients in the room
        io.to(roomId).emit('receive-message', {
          _id: message._id.toString(),
          content: message.content,
          senderId: message.senderId.toString(),
          receiverId: message.receiverId.toString(),
          attachments: message.attachments,
          timestamp: message.timestamp.toISOString()
        });

        console.log(`📤 Message sent to room: ${roomId}`);
      } catch (error) {
        console.error(' Error saving message:', error);
        socket.emit('message-error', { error: 'Failed to save message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(` Client disconnected: ${socket.id}`);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Server ready on http://${hostname}:${port}`);
    console.log(` Socket.io server initialized`);
  });
});