import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from '@routes/auth-routes.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_, res) => {
    res.json({
        message: 'API works'
    });
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
