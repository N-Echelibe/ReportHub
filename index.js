import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from "@supabase/supabase-js";
import bodyParser from 'body-parser';


dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/hello', (req, res) => {
  res.json({message: 'Hello from the backend!'});
});

app.get('/api/data', async (req, res) => {
  const {data, error} = await supabase.from('userInfo').select('*');
  if (error) {
    res.json({error: error.message});
  } else {
    res.json(data);
  }
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: 'Login successful', data });
});

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: 'User registered successfully', user });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
