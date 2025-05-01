import { GoogleGenAI } from "@google/genai";

async function testScriptGeneration() {

const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [systemprompt],
  });
  console.log(response.text);
}

await main();
}

testScriptGeneration(); 