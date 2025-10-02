import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import dns from 'dns';

// Routes
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';
import channelRoutes from './routes/channels.js';
import messageRoutes from './routes/messages.js';

// DNS fix for Node.js (Atlas SRV issue)
dns.setDefaultResultOrder('ipv4first');

// __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Global DB variable
let db;

// MongoDB Connection
async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db("griffchat_db"); // 👈 create/use database named griffchat_db
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// Attach db to req so routes can access it
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Server running and connected to MongoDB Atlas!');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);

  socket.on('send_message', (data) => {
    io.emit('receive_message', data); // broadcast to all users
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { db }; // 👈 export db so models can use it
