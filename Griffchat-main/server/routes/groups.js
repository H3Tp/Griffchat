// // server/routes/groups.js
// import express from "express";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { authorizeRoles } from "../middleware/roleMiddleware.js";

// import {
//   createGroup,
//   deleteGroup,
//   findGroupsByMember,
// } from "../models/Group.js";

// const router = express.Router();

// // Create group (group-admin or super)
// router.post(
//   "/",
//   authMiddleware,
//   authorizeRoles("GroupAdmin", "Super"),
//   async (req, res) => {
//     try {
//       const groupId = await createGroup({
//         name: req.body.name,
//         adminId: req.user._id,
//       });
//       res.json({ message: "Group created", groupId });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// // Delete group (only super or group-admin of that group)
// router.delete(
//   "/:id",
//   authMiddleware,
//   authorizeRoles("GroupAdmin", "Super"),
//   async (req, res) => {
//     try {
//       await deleteGroup(req.params.id);
//       res.json({ message: "Group deleted" });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// // Get all groups user belongs to
// router.get("/my", authMiddleware, async (req, res) => {
//   try {
//     const groups = await findGroupsByMember(req.user._id);
//     res.json(groups);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
// server/routes/groups.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createGroup,
  deleteGroupById,
  findGroupsByMember,
  findGroupById,
  addAdminToGroup,
  removeAdminFromGroup,
} from "../models/Group.js";

const router = express.Router();

// Create group (GroupAdmin or Super)
router.post(
  "/",
  authMiddleware,
  authorizeRoles("GroupAdmin", "Super"),
  async (req, res) => {
    try {
      const groupId = await createGroup({
        name: req.body.name,
        adminId: req.user._id,
      });
      res.json({ message: "Group created", groupId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete group (GroupAdmin or Super)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("GroupAdmin", "Super"),
  async (req, res) => {
    try {
      const group = await findGroupById(req.params.id);
      if (!group) return res.status(404).json({ error: "Group not found" });

      await deleteGroupById(req.params.id);
      res.json({ message: "Group deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get all groups the user belongs to
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const groups = await findGroupsByMember(req.user._id);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: Add a new admin to group
router.post(
  "/:groupId/admin/:userId",
  authMiddleware,
  authorizeRoles("GroupAdmin", "Super"),
  async (req, res) => {
    try {
      const { groupId, userId } = req.params;
      const group = await findGroupById(groupId);
      if (!group) return res.status(404).json({ error: "Group not found" });

      await addAdminToGroup(groupId, userId);
      res.json({ message: "User promoted to admin" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Optional: Remove admin from group
router.post(
  "/:groupId/remove-admin/:userId",
  authMiddleware,
  authorizeRoles("Super"),
  async (req, res) => {
    try {
      const { groupId, userId } = req.params;
      const group = await findGroupById(groupId);
      if (!group) return res.status(404).json({ error: "Group not found" });

      await removeAdminFromGroup(groupId, userId);
      res.json({ message: "Admin removed from group" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
