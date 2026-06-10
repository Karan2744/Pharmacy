import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { NextResponse } from 'next/server';

// Hardcoded admin credentials — login works instantly even without a DB connection
const HARDCODED_ADMINS = [
  { username: "Karan1234", password: "Karan@1234" },
];

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // 1. Check hardcoded credentials — no DB call, always instant
    const isHardcoded = HARDCODED_ADMINS.some(
      (a) => a.username === username && a.password === password
    );
    if (isHardcoded) {
      // Fire-and-forget: persist to DB in background so the user also exists in Atlas
      dbConnect()
        .then((conn) => conn && Admin.findOneAndUpdate(
          { username },
          { username, password },
          { upsert: true, new: true }
        ))
        .catch(() => {/* DB unavailable — login still succeeds */});

      return NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });
    }

    // 2. Fall back to DB for any other admins
    await dbConnect();
    const admin = await Admin.findOne({ username, password });
    if (admin) {
      return NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
