import express from 'express';
import Message from '../models/Message.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get messages by group + channel
router.get('/:groupId/:channelId', authMiddleware, async (req, res) => {
  try {
    const { groupId, channelId } = req.params;
    const messages = await Message.find({ group: groupId, channel: channelId }).populate('sender', 'email');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send message
router.post('/:groupId/:channelId', authMiddleware, async (req, res) => {
  try {
    const { groupId, channelId } = req.params;
    const msg = new Message({
      group: groupId,
      channel: channelId,
      sender: req.user._id,
      text: req.body.text
    });
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
