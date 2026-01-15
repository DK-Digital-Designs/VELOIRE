import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error';

// Routes
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Base Middleware
app.use(helmet({
    contentSecurityPolicy: false, // For demo ease with external images
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

// Serve static files from root
// We assume the server is running from server/dist or server/src
// Root is two levels up from server/src or server/dist
app.use(express.static(path.join(__dirname, '../../')));

// Fallback to index.html for SPA-like behavior if needed, 
// though we use multiple HTML files here.
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling (Must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`[Veloire Server] Running on http://localhost:${PORT}`);
    console.log(`[Mode] ${process.env.NODE_ENV || 'development'}`);
});
