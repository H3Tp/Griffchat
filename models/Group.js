// models/Group.js
import { db } from "../server.js";
import { ObjectId } from "mongodb";

export const Groups = () => db.collection("groups");

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
  return await Groups().deleteOne({ _id: new ObjectId(groupId) });
}

// Find groups by member
export async function findGroupsByMember(userId) {
  return await Groups()
    .find({ members: new ObjectId(userId) })
    .toArray();
}
