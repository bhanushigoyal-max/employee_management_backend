import mongoose from 'mongoose';
import { MESSAGES } from '../lang/messages';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(MESSAGES.SYSTEM.MONGO_URI_MISSING);
    }

    const conn = await mongoose.connect(mongoUri);
    isConnected = conn.connections[0].readyState === 1;
    console.log(MESSAGES.SYSTEM.DB_CONNECTED(conn.connection.host));
  } catch (error) {
    console.error(MESSAGES.SYSTEM.DB_CONNECTION_ERROR((error as Error).message));
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    } else {
      throw error;
    }
  }
};
