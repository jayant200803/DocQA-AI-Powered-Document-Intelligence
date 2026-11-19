import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Fail fast with a clear error instead of hanging the boot forever if the
    // database can't be reached.
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
