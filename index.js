import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import registerRouter from './routes/api/auth/register.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3020;
const app = express();

const corsOptions = {
    credentials: true,
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use('/auth/register', registerRouter);


app.listen(PORT, () => console.log(`Server running at: http://localhost:${PORT}`))
