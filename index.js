import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

app.get('/api/hello', (req, res) => {
  res.json({message: 'Hello from the backend!'});
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 