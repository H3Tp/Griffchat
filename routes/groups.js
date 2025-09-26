import express from 'express';
import Group from '../models/Group.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Create group (group-admin or super)
router.post('/', authMiddleware, roleMiddleware(['group-admin', 'super']), async (req, res) => {
  try {
    const group = new Group({ name: req.body.name, admins: [req.user._id], members: [req.user._id] });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete group (only super or group-admin of that group)
router.delete('/:id', authMiddleware, roleMiddleware(['group-admin', 'super']), async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all groups user belongs to
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
