// // server/routes/channels.js
// import express from "express";
// import {
//   createChannel,
//   findChannelsByGroup,
//   addMember,
//   removeMember,
//   Channels,
// } from "../models/Channel.js";
// import { Groups } from "../models/Group.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { authorizeRoles } from "../middleware/roleMiddleware.js";
// import { ObjectId } from "mongodb";

// const router = express.Router();

// /**
//  * Create a channel inside a group
//  * Access: GroupAdmin or Super
//  */
// router.post(
//   "/:groupId",
//   authMiddleware,
//   authorizeRoles("GroupAdmin", "Super"),
//   async (req, res) => {
//     try {
//       const { groupId } = req.params;
//       const { name } = req.body;

//       // Check if group exists
//       const group = await Groups().findOne({ _id: new ObjectId(groupId) });
//       if (!group) return res.status(404).json({ error: "Group not found" });

//       const channelId = await createChannel({
//         name,
//         groupId,
//         createdBy: req.user._id,
//       });

//       res.json({ message: "Channel created", channelId });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// /**
//  * Delete a channel
//  * Access: GroupAdmin or Super
//  */
// router.delete(
//   "/:channelId",
//   authMiddleware,
//   authorizeRoles("GroupAdmin", "Super"),
//   async (req, res) => {
//     try {
//       const { channelId } = req.params;

//       await Channels().deleteOne({ _id: new ObjectId(channelId) });

//       res.json({ message: "Channel deleted" });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// /**
//  * List channels in a group
//  * Access: any authenticated user in the group
//  */
// router.get(
//   "/group/:groupId",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const { groupId } = req.params;
//       const channels = await findChannelsByGroup(groupId);

//       res.json(channels);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// /**
//  * Ban a user from a channel
//  * Access: GroupAdmin or Super
//  */
// router.post(
//   "/:channelId/ban/:userId",
//   authMiddleware,
//   authorizeRoles("GroupAdmin", "Super"),
//   async (req, res) => {
//     try {
//       const { channelId, userId } = req.params;

//       const channel = await Channels().findOne({ _id: new ObjectId(channelId) });
//       if (!channel) return res.status(404).json({ error: "Channel not found" });

//       await Channels().updateOne(
//         { _id: new ObjectId(channelId) },
//         { $addToSet: { banned: new ObjectId(userId) }, $set: { updatedAt: new Date() } }
//       );

//       res.json({ message: "User banned from channel" });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// /**
//  * Unban a user from a channel
//  * Access: GroupAdmin or Super
//  */
// router.post(
//   "/:channelId/unban/:userId",
//   authMiddleware,
//   authorizeRoles("GroupAdmin", "Super"),
//   async (req, res) => {
//     try {
//       const { channelId, userId } = req.params;

//       const channel = await Channels().findOne({ _id: new ObjectId(channelId) });
//       if (!channel) return res.status(404).json({ error: "Channel not found" });

//       await Channels().updateOne(
//         { _id: new ObjectId(channelId) },
//         { $pull: { banned: new ObjectId(userId) }, $set: { updatedAt: new Date() } }
//       );

//       res.json({ message: "User unbanned from channel" });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// export default router;
// server/routes/channels.js
import express from "express";
import {
  createChannel,
  findChannelsByGroup,
  findChannelById,
  banUser,
  unbanUser,
  deleteChannelById,
} from "../models/Channel.js";
import { findGroupById } from "../models/Group.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * Create a channel inside a group
 * Access: GroupAdmin or Super
 */
router.post(
  "/:groupId",
  authMiddleware,
  authorizeRoles("GroupAdmin", "Super"),
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const { name } = req.body;

      // Check if group exists
      const group = await findGroupById(groupId);
      if (!group) return res.status(404).json({ error: "Group not found" });

      const channelId = await createChannel({
        name,
        groupId,
        createdBy: req.user._id,
      });

      res.json({ message: "Channel created", channelId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Delete a channel
 * Access: GroupAdmin or Super
 */
router.delete(
  "/:channelId",
  authMiddleware,
  authorizeRoles("GroupAdmin", "Super"),
  async (req, res) => {
    try {
      const { channelId } = req.params;

      const channel = await findChannelById(channelId);
      if (!channel) return res.status(404).json({ error: "Channel not found" });

      await deleteChannelById(channelId);
      res.json({ message: "Channel deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * List channels in a group
 * Access: any authenticated user in the group
 */
router.get(
  "/group/:groupId",
  authMiddleware,
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const channels = await findChannelsByGroup(groupId);

      res.json(channels);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Ban a user from a channel
 * Access: GroupAdmin or Super
 */
router.post(
  "/:channelId/ban/:userId",
  authMiddleware,
  authorizeRoles("GroupAdmin", "Super"),
  async (req, res) => {
    try {
      const { channelId, userId } = req.params;

      const channel = await findChannelById(channelId);
      if (!channel) return res.status(404).json({ error: "Channel not found" });

      await banUser(channelId, userId);
      res.json({ message: "User banned from channel" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Unban a user from a channel
 * Access: GroupAdmin or Super
 */
router.post(
  "/:channelId/unban/:userId",
  authMiddleware,
  authorizeRoles("GroupAdmin", "Super"),
  async (req, res) => {
    try {
      const { channelId, userId } = req.params;

      const channel = await findChannelById(channelId);
      if (!channel) return res.status(404).json({ error: "Channel not found" });

      await unbanUser(channelId, userId);
      res.json({ message: "User unbanned from channel" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
