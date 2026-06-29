import 'dotenv/config'; // Load environment variables first

import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './src/config/db';
import routes from './src/routes';

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, process.env.NODE_ENV === 'production' ? '../uploads' : 'uploads')));

// API Routes
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
