import OpenAI from 'openai';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";


dotenv.config();

// Check if OpenAI API key is available
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// if (!OPENAI_API_KEY) {
//     console.error("❌ OPENAI_API_KEY is not defined in .env - AI features will be disabled");
//     throw new Error("OPENAI_API_KEY is required for script generation");
// }

// console.log("🔑 OpenAI API Key:", OPENAI_API_KEY ? "✅ Present" : "❌ Missing");


const ai = new GoogleGenAI({ apiKey: "AIzaSyA_nNa7X7xBeNitUHWOfVrZrAsAMSqKBmE" });


export const generateScript = async (inputText) => {
    try {
        console.log(`🤖 Generating script from input: "${inputText}"`);

        if (!inputText || typeof inputText !== 'string') {
            throw new Error("Invalid input text provided");
        }

        const systemprompt = `
You are a podcast scriptwriter. Write a complete podcast episode script based on the following topic:

Topic: "${inputText}"

The script should have:
- An engaging introduction
- Key talking points or storylines
- A clear structure (intro, middle, outro)
- A natural, conversational tone
- Duration: around 5-7 minutes when read aloud
`;

        console.log("📝 Sending request to OpenAI with prompt:", prompt);
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [systemprompt],
          });
          console.log(response.text);
        

        // console.log("📥 Received response from OpenAI:", completion);

        // if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
        //     console.error("❌ Invalid response structure:", completion);
        //     throw new Error("Invalid response from OpenAI");
        // }

        const generatedScript = response.text;
        console.log("✅ Script generated successfully:", generatedScript);
        return generatedScript;

    } catch (error) {
        console.error("❌ Script Generation Error:", error);
        if (error.response) {
            console.error("OpenAI API Error Details:", error.response.data);
        }
        throw new Error(`Failed to generate script: ${error.message}`);
    }
}; 