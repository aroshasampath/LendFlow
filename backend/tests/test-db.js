import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('[Test] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'lendflow',
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[Success] Connected to cluster host: ${conn.connection.host}`);
    console.log(`[Success] Target database name: ${conn.connection.name}`);

    // Ping the admin or database to verify read/write access
    const adminDb = conn.connection.db.admin();
    const pingResult = await adminDb.ping();
    console.log(`[Success] Database ping response:`, pingResult);

    await mongoose.disconnect();
    console.log('[Success] Connection closed cleanly.');
    process.exit(0);
  } catch (err) {
    console.error(`[Error] Database connection failed:`, err.message);
    process.exit(1);
  }
};

testConnection();

