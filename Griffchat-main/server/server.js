
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import { createServer } from "http";
// import { Server as SocketServer } from "socket.io";
// import { fileURLToPath } from "url";
// import path from "path";
// import dns from "dns";
// import { ExpressPeerServer } from "peer";

// // Routes
// import authRoutes from "./routes/auth.js";
// import groupRoutes from "./routes/groups.js";
// import channelRoutes from "./routes/channels.js";
// import messageRoutes from "./routes/messages.js";

// // DB
// import { connectDB, getDB } from "./db.js";

// dns.setDefaultResultOrder("ipv4first");

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const httpServer = createServer(app);
// const io = new SocketServer(httpServer, {
//   cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
// });

// // PeerJS
// const peerServer = ExpressPeerServer(httpServer, { debug: true, path: "/peerjs" });
// app.use("/peerjs", peerServer);

// // Middleware
// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use(express.json());

// // Connect MongoDB
// await connectDB();

// // Attach db to req
// app.use((req, res, next) => {
//   req.db = getDB();
//   next();
// });

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/groups", groupRoutes);
// app.use("/api/channels", channelRoutes);
// app.use("/api/messages", messageRoutes);

// // Test route
// app.get("/test", (req, res) => {
//   res.send("✅ Server running and connected to MongoDB!");
// });

// // Socket.io
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("send_message", async (data) => {
//     try {
//       const messagesCollection = getDB().collection("messages");
//       await messagesCollection.insertOne({ ...data, timestamp: new Date() });

//       io.emit("receive_message", data);
//     } catch (err) {
//       console.error("Error saving message:", err);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// // Start server
// const PORT = process.env.PORT || 4000;
// httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let db;

// 🔹 Connect MongoDB
export async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      tls: true,
      tlsAllowInvalidCertificates: true, // For local testing only
      tlsAllowInvalidHostnames: true,
    });
    await client.connect();
    db = client.db("griffchat"); // 👈 database name
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

// Helper to get DB safely
export function getDB() {
  if (!db) throw new Error("Database not initialized. Call connectDB() first.");
  return db;
}

// 🔹 Health check
// app.get('/api/health', (_req, res) => {
//   res.json({ status: 'ok', dbConnected: !!db });
// });

// Test route at root
app.get("/", (req, res) => {
  res.send("✅ Server is running! Use /api/... endpoints to interact.");
});


// 🔹 Create HTTP Server
const server = http.createServer(app);

// 🔹 Setup Socket.IO
const io = new Server(server, {
  cors: { origin: 'http://localhost:4200', methods: ['GET', 'POST'] },
});

// ✅ Socket.IO Events
io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on('joinRoom', (groupId) => {
    socket.join(groupId);
    console.log(`👥 User joined group: ${groupId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { groupId, sender, text } = data;
    try {
      await getDB().collection('messages').insertOne({
        groupId,
        sender,
        text,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('❌ Failed to save message:', err);
    }
    io.to(groupId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

// 🔹 Start Server after DB connection
const PORT = process.env.PORT || 4000;
await connectDB();
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
