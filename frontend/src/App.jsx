import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch audio conversion history on load
  useEffect(() => {
    const fetchAudioHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/audio-history");
        setHistory(response.data);
      } catch (error) {
        console.error("❌ Error fetching audio history:", error);
      }
    };
    fetchAudioHistory();
  }, []);

  // Generate speech and fetch audio file
  const generateSpeech = async () => {
    if (!text.trim()) {
      alert("⚠️ Please enter text before converting.");
      return;
    }

    try {
      console.log("📢 Sending request:", text);
      const response = await axios.post("http://localhost:5000/generate-audio", { text });

      console.log("✅ Response received:", response.data);
      setAudioUrl(response.data.audioUrl);

      setHistory((prevHistory) => [
        { text, audioUrl: response.data.audioUrl },
        ...prevHistory,
      ]);
    } catch (error) {
      console.error("❌ Speech generation error:", error);
      alert("⚠️ Error generating speech. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full 
                    bg-gray-900 text-white p-6">
      
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 animate-fade-in">🔊 Text-to-Speech Converter</h1>

      {/* Text Input */}
      <textarea
        className="w-96 h-32 p-3 rounded-lg border-2 border-gray-700 bg-gray-800 
                   focus:border-blue-500 focus:outline-none resize-none 
                   transition-all duration-500 ease-in-out transform focus:scale-105"
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ resize: "none" }}
      ></textarea>

      {/* Convert Button */}
      <button
        onClick={generateSpeech}
        className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-black font-bold 
                   rounded-lg transition-all duration-700 ease-in-out transform 
                   hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
      >
        🎙 Convert to Speech
      </button>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-6 flex items-center gap-2">
          <audio key={audioUrl} controls className="w-80">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Audio History */}
      <div className="w-full max-w-lg mt-8">
        <h2 className="text-xl font-semibold">📜 Audio History</h2>
        <ul className="mt-4 space-y-4">
          {history.length > 0 ? (
            history.map((item, index) => (
              <li key={index} className="bg-gray-800 p-4 rounded-lg shadow-md transition hover:scale-105">
                <p className="text-sm text-gray-300">{item.text}</p>
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
