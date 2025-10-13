// // models/Group.js
// import { db } from "../server.js";
// import { ObjectId } from "mongodb";

// export const Groups = () => db.collection("groups");

// // Create group
// export async function createGroup({ name, adminId }) {
//   const result = await Groups().insertOne({
//     name,
//     admins: [new ObjectId(adminId)],
//     members: [new ObjectId(adminId)],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });
//   return result.insertedId;
// }

// // Delete group
// export async function deleteGroup(groupId) {
//   return await Groups().deleteOne({ _id: new ObjectId(groupId) });
// }

// // Find groups by member
// export async function findGroupsByMember(userId) {
//   return await Groups()
//     .find({ members: new ObjectId(userId) })
//     .toArray();
// }
// models/Group.js
import { ObjectId } from "mongodb";
import { getDB } from "../db.js"; // ✅ use getDB instead of db from server.js

export const Groups = () => getDB().collection("groups");

// Create group
export async function createGroup({ name, adminId }) {
  const result = await Groups().insertOne({
    name,
    admins: [new ObjectId(adminId)],
    members: [new ObjectId(adminId)],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId;
}

// Delete group
export async function deleteGroup(groupId) {
  if (!ObjectId.isValid(groupId)) return null;
  return await Groups().deleteOne({ _id: new ObjectId(groupId) });
}

// Find groups by member
export async function findGroupsByMember(userId) {
  if (!ObjectId.isValid(userId)) return [];
  return await Groups()
    .find({ members: new ObjectId(userId) })
    .toArray();
}

// Find group by ID
export async function findGroupById(groupId) {
  if (!ObjectId.isValid(groupId)) return null;
  return await Groups().findOne({ _id: new ObjectId(groupId) });
}

// Update group (example: add/remove members)
export async function updateGroup(groupId, updates) {
  if (!ObjectId.isValid(groupId)) return null;

  updates.updatedAt = new Date();

  const result = await Groups().findOneAndUpdate(
    { _id: new ObjectId(groupId) },
    { $set: updates },
    { returnDocument: "after" }
  );

  return result.value;
}
