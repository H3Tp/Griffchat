// import { db } from "../server.js";
// import { ObjectId } from "mongodb";

// // Get the channels collection
// export const Channels = () => db.collection("channels");

// /**
//  * Create a new channel
//  */
// export async function createChannel({ name, groupId, createdBy, members = [] }) {
//   const result = await Channels().insertOne({
//     name,
//     group: new ObjectId(groupId),  // Reference to Group
//     createdBy: createdBy ? new ObjectId(createdBy) : null, // Reference to User
//     members: members.map((id) => new ObjectId(id)), // User IDs
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });

//   return { _id: result.insertedId, name, groupId, createdBy, members };
// }

// /**
//  * Find channels belonging to a specific group
//  */
// export async function findChannelsByGroup(groupId) {
//   return await Channels()
//     .find({ group: new ObjectId(groupId) })
//     .toArray();
// }

// /**
//  * Add a member to a channel
//  */
// export async function addMember(channelId, userId) {
//   return await Channels().updateOne(
//     { _id: new ObjectId(channelId) },
//     {
//       $addToSet: { members: new ObjectId(userId) }, // avoids duplicates
//       $set: { updatedAt: new Date() },
//     }
//   );
// }

// /**
//  * Remove a member from a channel
//  */
// export async function removeMember(channelId, userId) {
//   return await Channels().updateOne(
//     { _id: new ObjectId(channelId) },
//     {
//       $pull: { members: new ObjectId(userId) },
//       $set: { updatedAt: new Date() },
//     }
//   );
// }

// /**
//  * Find a channel by ID
//  */
// export async function findChannelById(channelId) {
//   return await Channels().findOne({ _id: new ObjectId(channelId) });
// }
// models/Channel.js
import { ObjectId } from "mongodb";
import { getDB } from "../db.js"; // ✅ use getDB instead of db from server.js

// Get the channels collection
export const Channels = () => getDB().collection("channels");

/**
 * Create a new channel
 */
export async function createChannel({ name, groupId, createdBy, members = [] }) {
  if (!ObjectId.isValid(groupId)) throw new Error("Invalid groupId");
  if (createdBy && !ObjectId.isValid(createdBy)) throw new Error("Invalid createdBy userId");

  const result = await Channels().insertOne({
    name,
    group: new ObjectId(groupId), // Reference to Group
    createdBy: createdBy ? new ObjectId(createdBy) : null, // Reference to User
    members: members.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id)), // User IDs
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { _id: result.insertedId, name, groupId, createdBy, members };
}

/**
 * Find channels belonging to a specific group
 */
export async function findChannelsByGroup(groupId) {
  if (!ObjectId.isValid(groupId)) return [];
  return await Channels()
    .find({ group: new ObjectId(groupId) })
    .toArray();
}

/**
 * Add a member to a channel
 */
export async function addMember(channelId, userId) {
  if (!ObjectId.isValid(channelId) || !ObjectId.isValid(userId)) return null;

  return await Channels().updateOne(
    { _id: new ObjectId(channelId) },
    {
      $addToSet: { members: new ObjectId(userId) }, // avoids duplicates
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Remove a member from a channel
 */
export async function removeMember(channelId, userId) {
  if (!ObjectId.isValid(channelId) || !ObjectId.isValid(userId)) return null;

  return await Channels().updateOne(
    { _id: new ObjectId(channelId) },
    {
      $pull: { members: new ObjectId(userId) },
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Find a channel by ID
 */
export async function findChannelById(channelId) {
  if (!ObjectId.isValid(channelId)) return null;
  return await Channels().findOne({ _id: new ObjectId(channelId) });
}
