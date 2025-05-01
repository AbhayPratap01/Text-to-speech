import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [generatedScript, setGeneratedScript] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch audio conversion history on load
  useEffect(() => {
    const fetchAudioHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/audio-history");
        setHistory(response.data);
      } catch (error) {
        console.error("❌ Error fetching audio history:", error);
        setError("Failed to load history. Please try again later.");
      }
    };
    fetchAudioHistory();
  }, []);

  // Generate speech and fetch audio file
  const generateSpeech = async () => {
    if (!text.trim()) {
      setError("⚠️ Please enter text before converting.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("📢 Sending request:", text);
      const response = await axios.post("http://localhost:5000/generate-audio", { text });

      console.log("✅ Response received:", response.data);
      setAudioUrl(response.data.audioUrl);
      setGeneratedScript(response.data.generatedScript);

      setHistory((prevHistory) => [
        { 
          text, 
          generatedScript: response.data.generatedScript,
          audioUrl: response.data.audioUrl 
        },
        ...prevHistory,
      ]);
    } catch (error) {
      console.error("❌ Speech generation error:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      setError(`⚠️ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full 
                    bg-gray-900 text-white p-6">
      
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 animate-fade-in">🔊 AI Script Generator & Text-to-Speech</h1>

      {/* Text Input */}
      <div className="w-full max-w-2xl">
        <label className="block text-sm font-medium text-gray-300 mb-2">Enter your topic or idea:</label>
        <textarea
          className="w-full h-32 p-3 rounded-lg border-2 border-gray-700 bg-gray-800 
                     focus:border-blue-500 focus:outline-none resize-none 
                     transition-all duration-500 ease-in-out transform focus:scale-105"
          placeholder="Type your topic or idea here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ resize: "none" }}
        ></textarea>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={generateSpeech}
          disabled={isLoading}
          className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-black font-bold 
                     rounded-lg transition-all duration-700 ease-in-out transform 
                     hover:scale-110 active:scale-95 shadow-md hover:shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "🔄 Generating..." : "🎙 Generate & Convert to Speech"}
        </button>

        {/* Generated Script */}
        {generatedScript && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Generated Script:</label>
            <textarea
              className="w-full h-48 p-3 rounded-lg border-2 border-gray-700 bg-gray-800 
                         focus:border-blue-500 focus:outline-none resize-none 
                         transition-all duration-500 ease-in-out"
              value={generatedScript}
              readOnly
              style={{ resize: "none" }}
            ></textarea>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="mt-6 flex items-center gap-2">
            <audio key={audioUrl} controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>

      {/* Audio History */}
      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-xl font-semibold">📜 History</h2>
        <ul className="mt-4 space-y-4">
          {history.length > 0 ? (
            history.map((item, index) => (
              <li key={index} className="bg-gray-800 p-4 rounded-lg shadow-md transition hover:scale-105">
                <p className="text-sm text-gray-300 font-semibold">Original Text:</p>
                <p className="text-sm text-gray-400 mb-2">{item.text}</p>
                <p className="text-sm text-gray-300 font-semibold">Generated Script:</p>
                <p className="text-sm text-gray-400 mb-2">{item.generatedScript}</p>
                <audio controls className="w-full mt-2">
                  <source src={item.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </li>
            ))
          ) : (
            <p className="text-gray-500 mt-2">No history available.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
