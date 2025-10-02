import { db } from "../server.js";
import { ObjectId } from "mongodb";

export const Messages = () => db.collection("messages");

// Create a new message
export async function createMessage({ groupId, channelId, senderId, text }) {
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
  return await Messages()
    .find({
      group: new ObjectId(groupId),
      channel: new ObjectId(channelId),
    })
    .sort({ createdAt: 1 }) // oldest → newest
    .toArray();
}
