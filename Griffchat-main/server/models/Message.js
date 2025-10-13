// import { db } from "../server.js";
// import { ObjectId } from "mongodb";

// export const Messages = () => db.collection("messages");

// // Create a new message
// export async function createMessage({ groupId, channelId, senderId, text }) {
//   const result = await Messages().insertOne({
//     group: new ObjectId(groupId),
//     channel: new ObjectId(channelId),
//     sender: new ObjectId(senderId),
//     text,
//     createdAt: new Date(),
//   });
//   return result.insertedId;
// }

// // Find all messages in a group & channel
// export async function findMessagesByGroupAndChannel(groupId, channelId) {
//   return await Messages()
//     .find({
//       group: new ObjectId(groupId),
//       channel: new ObjectId(channelId),
//     })
//     .sort({ createdAt: 1 }) // oldest → newest
//     .toArray();
// }
// models/Message.js
import { ObjectId } from "mongodb";
import { getDB } from "../db.js"; // ✅ use getDB instead of db from server.js

// Get the messages collection
export const Messages = () => getDB().collection("messages");

// Create a new message
export async function createMessage({ groupId, channelId, senderId, text }) {
  if (!ObjectId.isValid(groupId)) throw new Error("Invalid groupId");
  if (!ObjectId.isValid(channelId)) throw new Error("Invalid channelId");
  if (!ObjectId.isValid(senderId)) throw new Error("Invalid senderId");

  const result = await Messages().insertOne({
    group: new ObjectId(groupId),
    channel: new ObjectId(channelId),
    sender: new ObjectId(senderId),
    text,
    createdAt: new Date(),
  });

  return result.insertedId;
}

// Find all messages in a group & channel
export async function findMessagesByGroupAndChannel(groupId, channelId) {
  if (!ObjectId.isValid(groupId) || !ObjectId.isValid(channelId)) return [];

  return await Messages()
    .find({
      group: new ObjectId(groupId),
      channel: new ObjectId(channelId),
    })
    .sort({ createdAt: 1 }) // oldest → newest
    .toArray();
}

// Optional: Find message by ID
export async function findMessageById(messageId) {
  if (!ObjectId.isValid(messageId)) return null;
  return await Messages().findOne({ _id: new ObjectId(messageId) });
}

// Optional: Delete message by ID
export async function deleteMessage(messageId) {
  if (!ObjectId.isValid(messageId)) return null;
  return await Messages().deleteOne({ _id: new ObjectId(messageId) });
}
