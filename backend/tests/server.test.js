import request from "supertest";
import express from "express";
import {jest} from "@jest/globals";

const insertOneMock = jest.fn();
const findMock = jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) });

const dbMock = {
  collection: jest.fn(() => ({
    insertOne: insertOneMock,
    find: findMock
  })),
};

const app = express();
app.use(express.json());

app.post("/api/messages", async (req, res) => {
  const { groupId, sender, text } = req.body;
  if (!groupId || !sender || !text)
    return res.status(400).json({ error: "Missing fields" });
  await dbMock.collection("messages").insertOne({ groupId, sender, text });
  res.status(201).json({ message: "Message saved successfully" });
});

app.get("/api/messages", async (req, res) => {
  const messages = await dbMock.collection("messages").find().toArray();
  res.status(200).json(messages);
});

// ✅ Tests
describe("GriffChat API without real MongoDB", () => {
  it("should return 400 for missing fields", async () => {
    const res = await request(app).post("/api/messages").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing fields");
  });

  it("should insert a message successfully", async () => {
    const res = await request(app)
      .post("/api/messages")
      .send({ groupId: "g1", sender: "user1", text: "hi" });

    expect(res.status).toBe(201);
    expect(insertOneMock).toHaveBeenCalledWith({
      groupId: "g1",
      sender: "user1",
      text: "hi"
    });
  });

  it("should retrieve all messages", async () => {
    const res = await request(app).get("/api/messages");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
