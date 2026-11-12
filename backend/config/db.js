import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas with robust error handling and event listeners.
 * Targets the 'lendflow' database and logs safely without exposing credentials.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'YOUR_MONGODB_CONNECTION_STRING') {
    const errorMsg = 'CRITICAL: MONGODB_URI is not defined in backend/.env. Please configure your Atlas connection string.';
    console.error(`[Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    console.log(`[Database] Initiating secure connection to MongoDB Atlas...`);

    const connectionInstance = await mongoose.connect(uri, {
      dbName: 'lendflow', // Enforce lendflow database
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[Database] MongoDB Connected successfully to host: ${connectionInstance.connection.host}`);
    console.log(`[Database] Target Database: ${connectionInstance.connection.name}`);

    // Register runtime event listeners
    mongoose.connection.on('error', () => {
      console.error('[Database Runtime Error] An unexpected database connection error occurred.');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Notice] MongoDB disconnected.');
    });

    return connectionInstance;
  } catch (error) {
    console.error(`[Database Connection Failure] Failed to connect to MongoDB Atlas.`);
    throw error;
  }
};
