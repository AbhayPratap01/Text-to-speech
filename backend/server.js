import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { textToSpeech } from "./Models/text-to-speech.js"; // Your TTS function
import Audio from "./Models/AudioModel.js"; // Import MongoDB model
import apiRoutes from "./api/index.js";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URL;
if (!mongoURI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.use("/api", apiRoutes); 

// Ensure 'public/audio' directory exists
const audioDir = path.join(__dirname, "public", "audio");
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

// 📌 Route: Generate Speech & Save Audio
app.post("/generate-audio", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    console.log(`🔹 Received text: "${text}"`);

    // Generate Speech Audio
    const audioBuffer = await textToSpeech(text);
    
    // 🛑 Validate audio buffer
    if (!audioBuffer || audioBuffer.length < 100) {
      console.error("❌ Invalid audio buffer received");
      return res.status(500).json({ error: "Audio generation failed" });
    }

    console.log("✅ Audio buffer received, saving file...");

    // Save Audio File Locally
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = path.join(audioDir, fileName);
    fs.writeFileSync(filePath, audioBuffer);

    // Construct the public URL
    const audioUrl = `http://localhost:5000/audio/${fileName}`;

    // Save in MongoDB
    const newAudio = new Audio({ text, audioUrl });
    await newAudio.save();

    res.json({ audioUrl });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to generate audio" });
  }
});

// 📌 Route: Fetch Audio History from MongoDB
app.get("/audio-history", async (req, res) => {
  try {
    const audioRecords = await Audio.find().sort({ createdAt: -1 });
    res.json(audioRecords);
  } catch (error) {
    console.error("❌ Fetch History Error:", error);
    res.status(500).json({ error: "Failed to fetch audio history" });
  }
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 📌 Serve audio files publicly
app.use("/audio", express.static(audioDir));
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));