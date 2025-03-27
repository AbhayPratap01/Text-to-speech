import express from "express";
import mongoose from "mongoose";
import { textToSpeech } from "../Models/text-to-speech.js";
import Audio from "../Models/AudioModel.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.post("/api/text-to-speech", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const audioBuffer = await textToSpeech(text);
    const newAudio = new Audio({ text, audioUrl: "your-s3-url" });
    await newAudio.save();

    res.json({ audioUrl: "your-s3-url" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

export default app;
