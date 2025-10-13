// MongoDB native connection
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let db;

export const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true, // for local/dev only
      tlsAllowInvalidHostnames: true,
    });

    await client.connect();
    db = client.db("griffchat"); // database name
    console.log("✅ MongoDB connected successfully");

    // Optional: Ping test
    await db.command({ ping: 1 });
    console.log("✅ Ping to MongoDB successful");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export const getDB = () => db;
