import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
