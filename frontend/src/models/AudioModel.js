import mongoose from "mongoose";

const audioSchema = new mongoose.Schema({
  text: { type: String, required: true },
  audioUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Audio = mongoose.model("Audio", audioSchema);
export default Audio;
