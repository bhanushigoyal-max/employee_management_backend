import { connectDB } from '../../src/config/db';
import mongoose from 'mongoose';
import { MESSAGES } from '../../src/lang/messages';

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('Database Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw an error if MONGO_URI is not defined', async () => {
    delete process.env.MONGO_URI;

    await connectDB();

    expect(console.error).toHaveBeenCalledWith(MESSAGES.SYSTEM.DB_CONNECTION_ERROR(MESSAGES.SYSTEM.MONGO_URI_MISSING));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should exit with 1 if connection fails', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    (mongoose.connect as jest.Mock).mockRejectedValue(new Error('Connection Failed'));

    await connectDB();

    expect(console.error).toHaveBeenCalledWith(MESSAGES.SYSTEM.DB_CONNECTION_ERROR('Connection Failed'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should connect to MongoDB successfully', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    const mockConnection = { connections: [{ readyState: 1 }], connection: { host: 'localhost' } };
    (mongoose.connect as jest.Mock).mockResolvedValue(mockConnection);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
    expect(console.log).toHaveBeenCalledWith(MESSAGES.SYSTEM.DB_CONNECTED('localhost'));
  });
});
