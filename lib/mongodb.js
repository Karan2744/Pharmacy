import mongoose from 'mongoose';

// NOTE: do NOT throw at module level — that crashes every API route at import time.
// The error is raised lazily inside dbConnect() so individual routes can handle it.

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not defined. Add it to .env.local → MONGODB_URI=mongodb://localhost:27017/pharmacy'
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;   // allow retry on next call
    throw e;
  }

  return cached.conn;
}

console.log("connecting to MongoDB...");

export default dbConnect;
