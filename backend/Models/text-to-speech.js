import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
    console.warn("⚠️ ELEVENLABS_API_KEY is not defined in .env - Text-to-speech features will be disabled");
}

// Ensure audio directory exists
const audioDir = path.join(__dirname, "..", "public", "audio");
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

export const textToSpeech = async (text) => {
    try {
        console.log(`🔹 Generating speech for: "${text}"`);

        if (!ELEVENLABS_API_KEY) {
            throw new Error("ELEVENLABS_API_KEY is not defined in .env");
        }

        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
            {
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: { stability: 0.5, similarity_boost: 0.8 }
            },
            {
                headers: {
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
            }
        );

        console.log("✅ TTS API Call Successful");

        if (!response.data || response.data.length === 0) {
            throw new Error("No valid audio data received");
        }

        // Generate unique filename
        const fileName = `audio_${Date.now()}.mp3`;
        const filePath = path.join(audioDir, fileName);

        // Save the audio file
        fs.writeFileSync(filePath, Buffer.from(response.data));

        // Return the public URL for the audio file
        return {
            buffer: Buffer.from(response.data),
            url: `/audio/${fileName}`
        };
    } catch (error) {
        console.error("❌ TTS Generation Error:", error.response?.data || error.message);
        throw new Error(`Failed to generate audio: ${error.message}`);
    }
};

const TextToSpeechSchema = new mongoose.Schema({
    text: { type: String, required: true },
    audioUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TextToSpeech", TextToSpeechSchema);