import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { publishSMS } from "@/lib/sns";

export async function POST(req) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }

    await connectDB();

    // Rate-limit: block if an unexpired OTP was sent in the last 30 seconds
    const recent = await Otp.findOne({
      phone,
      expiresAt: { $gt: new Date(Date.now() + 4.5 * 60 * 1000) }, // created < 30s ago
    });
    if (recent) {
      return NextResponse.json({ error: "Please wait 30 seconds before requesting a new OTP." }, { status: 429 });
    }

    // Delete any previous OTPs for this phone
    await Otp.deleteMany({ phone });

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({ phone, code, expiresAt });

    // Send SMS via AWS SNS
    await publishSMS(`+91${phone}`, `Your MauryaRx OTP is ${code}. Valid for 5 minutes. Do not share with anyone.`);

    return NextResponse.json({ success: true, message: "OTP sent successfully." });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
  }
}
