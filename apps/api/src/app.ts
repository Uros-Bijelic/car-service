import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from '../env.js';
import { authRoutes } from '@/routes/auth-routes.js';
import { authenticateToken } from '@/middleware/auth.js';
import { errorHandler } from './errors/error-handler.js';
import { authLimiter, generalLimiter } from './middleware/rate-limiter.js';

const app = express();
const PORT = env.PORT || 8080;

app.use(
    cors({
        origin: ['http://localhost:5173'],
        credentials: true
    })
);
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/health', (_, res) => {
    res.json({
        message: 'API works'
    });
});

app.use('/api/auth', authRoutes);
app.use(authenticateToken);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
