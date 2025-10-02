import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createMessage,
  findMessagesByGroupAndChannel,
} from "../models/Message.js";

const router = express.Router();

// 📌 Get messages by group + channel
router.get("/:groupId/:channelId", authMiddleware, async (req, res) => {
  try {
    const { groupId, channelId } = req.params;

    // Use helper function from models/Message.js
    const messages = await findMessagesByGroupAndChannel(groupId, channelId);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Send a message
router.post("/:groupId/:channelId", authMiddleware, async (req, res) => {
  try {
    const { groupId, channelId } = req.params;

    const msgId = await createMessage({
      groupId,
      channelId,
      senderId: req.user._id, // set by authMiddleware
      text: req.body.text,
    });

    res.json({ message: "Message sent", id: msgId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
