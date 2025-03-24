import mongoose from "mongoose";
import axios from "axios";

export const textToSpeech = async (text) => {
    try {
        console.log(`🔹 Generating speech for: "${text}"`);

        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, // ✅ Fixed API URL
            {
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: { stability: 0.5, similarity_boost: 0.8 }
            },
            {
                headers: {
                    "xi-api-key": "sk_fbd81da743ff32fb87911014852cf38577aad9cb9877e580", // ✅ Replace with real key
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer", // ✅ Ensures MP3 data
            }
        );

        console.log("✅ TTS API Call Successful");

        if (!response.data || response.data.length === 0) {
            throw new Error("No valid audio data received");
        }

        return Buffer.from(response.data); // Convert response to buffer
    } catch (error) {
        console.error("❌ TTS Generation Error:", error.response?.data || error.message);
        return null; // Prevents crashing
    }
};

const TextToSpeechSchema = new mongoose.Schema({
    text: { type: String, required: true },
    audioUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TextToSpeech", TextToSpeechSchema);