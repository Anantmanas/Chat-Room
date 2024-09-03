const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const authRoutes = require("./routes/auth");
require("dotenv").config();
require("./config/passport");
const ChatMessage = require("./models/Chat");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);
app.use(passport.initialize());
app.use(passport.session());

const dburi = process.env.DB_URI;
mongoose.connect(dburi, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/auth", authRoutes);

app.get("/messages", async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/messages", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const customUsername = req.user.customUsername;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch the user to ensure we have the latest customUsername
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const chatMessage = new ChatMessage({
      userId: userId,
      customUsername: user.customUsername,
      message,
    });

    await chatMessage.save();

    res.status(201).json(chatMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/messages/:id", authMiddleware, async (req, res) => {
  try {
    const messageId = req.params.id;
    const authenticatedUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Check if userId exists, if not, fall back to comparing customUsername
    if (message.userId) {
      if (message.userId.toString() !== authenticatedUserId) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this message" });
      }
    } else {
      // Fetch the authenticated user to get their customUsername
      const user = await User.findById(authenticatedUserId);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (message.customUsername !== user.customUsername) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this message" });
      }
    }

    await ChatMessage.findByIdAndDelete(messageId);

    res.status(200).json({ success: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
