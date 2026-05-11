import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { authRoutes } from '@routes/auth-routes.js';

const app = express();
const PORT = process.env.PORT || 8080;

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

app.get('/health', (_, res) => {
    res.json({
        message: 'API works'
    });
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
