const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customUsername: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
