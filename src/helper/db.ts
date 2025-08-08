import mongoose from 'mongoose';

// Global connection variable to track connection state
let isConnected = false;

export const connect = async () => {
  // If already connected, return
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  // Check if MONGO_URI is defined
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in environment variables');
    throw new Error('MONGO_URI is not defined');
  }

  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI as string);

    connection.on('connected', () => {
      isConnected = true;
      console.log('MongoDB connected successfully');
    });

    connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
      throw new Error(`MongoDB connection error: ${err.message}`);
    });

    // Check connection state
    if (connection.readyState === 1) {
      isConnected = true;
      console.log('MongoDB connected successfully');
      return;
    }
  } catch (error) {
    isConnected = false;
    console.error('Error connecting to database:', error);
    throw error; // Re-throw to allow proper error handling in API routes
  }
};