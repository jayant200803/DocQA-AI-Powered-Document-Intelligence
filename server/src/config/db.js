import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Explicit timeouts: without connectTimeoutMS/socketTimeoutMS the initial
    // handshake can hang indefinitely on some networks; these make the boot
    // fail fast with a clear error instead.
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
