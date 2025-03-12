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
  const email = req.body.email;
  const password = req.body.password;
  const {user, error} = await supabase.from('userInfo').select('*').eq(`email`,email).eq('password', password);
  if (error) {
    res.json({error: error.message})
  } else {
    res.json(user);
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
