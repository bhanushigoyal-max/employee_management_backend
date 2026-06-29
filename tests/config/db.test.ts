import { connectDB } from '../../src/config/db';
import mongoose from 'mongoose';

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('Database Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should connect to MongoDB successfully', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    const mockConnection = { connection: { host: 'localhost' } };
    (mongoose.connect as jest.Mock).mockResolvedValue(mockConnection);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
    expect(console.log).toHaveBeenCalledWith('MongoDB Connected: localhost');
  });

  it('should exit with 1 if connection fails', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    (mongoose.connect as jest.Mock).mockRejectedValue(new Error('Connection Failed'));

    await connectDB();

    expect(console.error).toHaveBeenCalledWith('Error connecting to MongoDB: Connection Failed');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should throw an error if MONGO_URI is not defined', async () => {
    delete process.env.MONGO_URI;

    await connectDB();

    expect(console.error).toHaveBeenCalledWith('Error connecting to MongoDB: MONGO_URI is not defined in the environment variables.');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
