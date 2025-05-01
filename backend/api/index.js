import express from "express";
import { textToSpeech } from "../Models/text-to-speech.js";
import { generateScript } from "../Models/scriptGenerator.js";
import Audio from "../Models/AudioModel.js";

const router = express.Router();

// Get audio history
router.get("/audio-history", async (req, res) => {
    try {
        const audioRecords = await Audio.find().sort({ createdAt: -1 });
        res.json(audioRecords);
    } catch (error) {
        console.error("❌ Fetch History Error:", error);
        res.status(500).json({ error: "Failed to fetch audio history" });
    }
});

// Generate script and audio
router.post("/generate-audio", async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text input is required" });
    }

    try {
        // First generate the script
        console.log("🤖 Generating script from input:", text);
        let generatedScript;
        try {
            generatedScript = await generateScript(text);
            console.log("✅ Script generated:", generatedScript);
        } catch (scriptError) {
            console.error("❌ Script generation error:", scriptError);
            return res.status(500).json({ 
                error: "Failed to generate script",
                details: scriptError.message
            });
        }
        
        // Then convert the generated script to speech
        console.log("🔊 Converting script to speech");
        let audioResult;
        try {
            audioResult = await textToSpeech(generatedScript);
            console.log("✅ Audio generated:", audioResult.url);
        } catch (audioError) {
            console.error("❌ Audio generation error:", audioError);
            return res.status(500).json({ 
                error: "Failed to generate audio",
                details: audioError.message
            });
        }
        
        // Save to database with both original text and generated script
        try {
            const newAudio = new Audio({
                text: text,
                generatedScript: generatedScript,
                audioUrl: audioResult.url
            });
            await newAudio.save();
            console.log("✅ Saved to database");

            res.json({
                success: true,
                originalText: text,
                generatedScript: generatedScript,
                audioUrl: audioResult.url
            });
        } catch (dbError) {
            console.error("❌ Database error:", dbError);
            return res.status(500).json({ 
                error: "Failed to save to database",
                details: dbError.message
            });
        }
    } catch (error) {
        console.error("❌ General error:", error);
        res.status(500).json({ 
            error: "An unexpected error occurred",
            details: error.message
        });
    }
});

export default router;
