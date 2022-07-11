import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 3020;
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


app.listen(PORT, () => console.log(`Server running at: http://localhost:${PORT}`))
