import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas with robust error handling and event listeners.
 * Ensures the target database is 'lendflow' and logs safely without exposing credentials.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'YOUR_MONGODB_CONNECTION_STRING') {
    const errorMsg = 'CRITICAL: MONGODB_URI is not defined in backend/.env. Please configure your Atlas connection string.';
    console.error(`[Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    // Mask sensitive connection details for secure logging
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[Database] Initiating connection to MongoDB...`);

    const connectionInstance = await mongoose.connect(uri, {
      dbName: 'lendflow', // Enforce lendflow database
      autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in development
      serverSelectionTimeoutMS: 8000, // Fail fast if cluster is unreachable or IP blocked
    });

    console.log(`[Database] MongoDB Connected successfully to host: ${connectionInstance.connection.host}`);
    console.log(`[Database] Active Database Name: ${connectionInstance.connection.name}`);

    // Register connection event monitors
    mongoose.connection.on('error', (err) => {
      console.error('[Database Runtime Error] MongoDB connection error occurred.');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Notice] MongoDB disconnected.');
    });

    return connectionInstance;
  } catch (error) {
    console.error(`[Database Connection Failure] ${error.message}`);
    throw error;
  }
};

