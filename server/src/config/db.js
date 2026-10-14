import mongoose from 'mongoose';

let mongoMemoryServer = null;

/**
 * Connect to MongoDB with automatic fallback to MongoMemoryServer
 * for seamless local development and automated testing.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/causalfunnel_analytics';

  // If already connected, skip
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Attempt to connect to configured URI first
  try {
    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // fast fail to fallback if mongod isn't running
    });
    console.log(`MongoDB connected successfully to ${uri}`);
    return mongoose.connection;
  } catch (primaryErr) {
    console.warn(`Could not connect to configured MongoDB (${primaryErr.message}).`);

    if (process.env.USE_MEMORY_DB !== 'false') {
      try {
        console.log('Starting in-memory MongoDB server fallback (zero-config)...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'causalfunnel_analytics',
          },
        });
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`MongoDB Memory Server connected at ${memoryUri}`);
        return mongoose.connection;
      } catch (memErr) {
        console.error('Failed to initialize MongoMemoryServer fallback:', memErr);
        throw primaryErr;
      }
    } else {
      throw primaryErr;
    }
  }
};

/**
 * Disconnect from MongoDB and stop in-memory server if running
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
  console.log('MongoDB disconnected.');
};

/**
 * Helper to check connection status
 */
export const isDbConnected = () => mongoose.connection.readyState === 1;
