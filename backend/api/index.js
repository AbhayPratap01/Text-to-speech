import mongoose from "mongoose";
import { textToSpeech } from "../Models/text-to-speech.js";
import Audio from "../Models/AudioModel.js";

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

export default async (req, res) => {
  if (req.method === "POST") {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const audioBuffer = await textToSpeech(text);
    const newAudio = new Audio({ text, audioUrl: "your-s3-url" });
    await newAudio.save();

    res.json({ audioUrl: "your-s3-url" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
