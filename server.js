"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./src/config/db");
const routes_1 = __importDefault(require("./src/routes"));
// Load environment variables
dotenv_1.default.config();
// Initialize express app
const app = (0, express_1.default)();
// Connect to database
(0, db_1.connectDB)();
// Middleware
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow all origins
        callback(null, true);
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, process.env.NODE_ENV === 'production' ? '../uploads' : 'uploads')));
// API Routes
app.use('/api', routes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
