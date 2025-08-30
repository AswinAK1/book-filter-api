import express from "express";
import cors from "cors";
import axios from "axios";
import type { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const users: { [email: string]: { password: string; favorites: any[] } } = {
  "test@example.com": {
    password: "123456",
    favorites: [],
  },
  "admin@example.com": {
    password: "admin123",
    favorites: [],
  },
};


// Login
app.post("/api/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password);

  if (!users[email] || users[email].password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({ message: "Login successful", email });
});


app.get("/api/books", async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: "Query is required" });
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${q}`
    );

    const books = response.data.items?.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
    }));

    return res.json(books || []);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});


app.get("/api/all-books", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=all&startIndex=0&maxResults=100`
    );

    const books = response.data.items?.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
    }));

    return res.json(books || []);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
