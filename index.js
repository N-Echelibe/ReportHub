import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import bodyParser from "body-parser";
import multer from "multer";
import { marked } from "marked";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.get("/api/data", async (req, res) => {
  const { data, error } = await supabase.from("userInfo").select("*");
  if (error) {
    res.json({ error: error.message });
  } else {
    res.json(data);
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "Login successful", user: data.user });
});

app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "User registered successfully", user });
});

// Route to get all posts
app.get("/api/posts", async (req, res) => {
  const { data, error } = await supabase
    .from("posts")
    .select("created_at, post_title, post_image, post_content, post_category");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.post("/api/posts", async (req, res) => {
  const { title, content, category, user_uid, image_url } = req.body; // Get data from frontend
  if (!user_id || !title || !content || !category || !image_url) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const { data, error } = await supabase
    .from("userPosts")
    .insert([
      {
        post_title: title,
        post_content: content,
        post_category: category,
        UID: user_uid,
        post_image: image_url
      },
    ]);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ message: "Post created successfully", data });
});

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage }); // Use memory storage
 // Save images to 'uploads' folder

app.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  // Define bucket name and file path
  const bucketName = "uploads"; // Change if needed
  const filePath = `images/${Date.now()}_${req.file.originalname}`;

  // Upload the image to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get public URL of uploaded file
  const { data: publicUrl } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  res.json({ url: publicUrl.publicUrl });
});


app.get("/post/:id", async (req, res) => {
  const { id } = req.params;

  const { data: post, error } = await supabase
    .from("userPosts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.content = marked(post.content); // Convert Markdown to HTML

  res.json(post); // Send JSON response
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
