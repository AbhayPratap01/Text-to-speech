import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { textToSpeech } from "./Models/text-to-speech.js";
import { generateScript } from "./Models/scriptGenerator.js";
import Audio from "./Models/AudioModel.js";
import apiRoutes from "./api/index.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Basic error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});

// Configure CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure body parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    // Ensure 'public/audio' directory exists
    const audioDir = path.join(__dirname, "public", "audio");
    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
        console.log("✅ Created audio directory");
    }

    // Serve static files from the public directory
    app.use(express.static(path.join(__dirname, "public")));
    app.use("/audio", express.static(audioDir));
    console.log("✅ Static file serving configured");
} catch (error) {
    console.error("❌ Error setting up static files:", error);
}

// MongoDB Connection
const mongoURI = process.env.MONGO_URL;
if (!mongoURI) {
    console.error("❌ MONGO_URI is not defined in .env");
    process.exit(1);
}

try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected");
} catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
}

// Use API routes
app.use('/api', apiRoutes);
console.log("✅ API routes configured");

// 📌 Route: Generate Script & Audio
app.post("/generate-audio", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        console.log(`🔹 Received text: "${text}"`);

        // First generate the script
        console.log("🤖 Generating script...");
        const generatedScript = await generateScript(text);
        console.log("✅ Script generated:", generatedScript);

        // Then generate speech from the script
        console.log("🎤 Converting to speech...");
        const audioResult = await textToSpeech(generatedScript);
        
        if (!audioResult || !audioResult.url) {
            throw new Error("Failed to generate audio");
        }

        console.log("✅ Audio generated successfully");

        // Save in MongoDB
        const newAudio = new Audio({
            text,
            generatedScript,
            audioUrl: audioResult.url
        });
        await newAudio.save();
        console.log("✅ Saved to database");

        res.json({
            success: true,
            originalText: text,
            generatedScript,
            audioUrl: audioResult.url
        });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ 
            error: "Failed to process request",
            details: error.message
        });
    }
});

// 📌 Route: Fetch Audio History
app.get("/audio-history", async (req, res) => {
    try {
        const audioRecords = await Audio.find().sort({ createdAt: -1 });
        res.json(audioRecords);
    } catch (error) {
        console.error("❌ Fetch History Error:", error);
        res.status(500).json({ error: "Failed to fetch audio history" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        details: err.message
    });
});

// Start server
const PORT = process.env.PORT || 5000;
try {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📝 API available at http://localhost:${PORT}/api`);
    });
} catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
}