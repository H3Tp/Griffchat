import express from 'express';
import Channel from './models/Channel.js';
import Group from '../models/Group.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * Create a channel inside a group
 * Access: group-admin of that group OR super
 */
router.post('/:groupId', authMiddleware, roleMiddleware(['group-admin', 'super']), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name } = req.body;

    // check group exists
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const channel = new Channel({ name, group: groupId });
    await channel.save();

    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete a channel
 * Access: group-admin of that group OR super
 */
router.delete('/:channelId', authMiddleware, roleMiddleware(['group-admin', 'super']), async (req, res) => {
  try {
    const { channelId } = req.params;
    await Channel.findByIdAndDelete(channelId);
    res.json({ message: 'Channel deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List channels in a group
 * Access: any authenticated user who is a member of the group
 */
router.get('/group/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const channels = await Channel.find({ group: groupId });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Ban a user from a channel
 * Access: group-admin of that group OR super
 */
router.post('/:channelId/ban/:userId', authMiddleware, roleMiddleware(['group-admin', 'super']), async (req, res) => {
  try {
    const { channelId, userId } = req.params;
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });

    if (!channel.banned.includes(userId)) {
      channel.banned.push(userId);
      await channel.save();
    }

    res.json({ message: 'User banned from channel' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Unban a user from a channel
 * Access: group-admin of that group OR super
 */
router.post('/:channelId/unban/:userId', authMiddleware, roleMiddleware(['group-admin', 'super']), async (req, res) => {
  try {
    const { channelId, userId } = req.params;
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });

    channel.banned = channel.banned.filter(id => id.toString() !== userId);
    await channel.save();

    res.json({ message: 'User unbanned from channel' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
