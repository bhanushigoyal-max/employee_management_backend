import mongoose from 'mongoose';
import { MESSAGES } from '../lang/messages';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(MESSAGES.SYSTEM.MONGO_URI_MISSING);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(MESSAGES.SYSTEM.DB_CONNECTED(conn.connection.host));
  } catch (error) {
    console.error(MESSAGES.SYSTEM.DB_CONNECTION_ERROR((error as Error).message));
    process.exit(1);
  }
};
