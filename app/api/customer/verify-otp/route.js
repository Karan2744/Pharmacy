import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Otp from "@/models/Otp";
import { signToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and OTP are required." }, { status: 400 });
    }

    await connectDB();

    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
      return NextResponse.json({ error: "OTP not found. Please request a new one." }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ phone });
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Allow max 5 attempts
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ phone });
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new OTP." }, { status: 429 });
    }

    if (otpRecord.code !== String(code)) {
      await Otp.updateOne({ phone }, { $inc: { attempts: 1 } });
      return NextResponse.json({ error: "Incorrect OTP. Please check and try again." }, { status: 400 });
    }

    // OTP is valid — delete it
    await Otp.deleteOne({ phone });

    // Upsert customer
    const customer = await Customer.findOneAndUpdate(
      { phone },
      { phone, lastLogin: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Issue JWT
    const token = await signToken({
      id: customer._id.toString(),
      phone: customer.phone,
    });

    return NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer._id.toString(),
        phone: customer.phone,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
