import { NextResponse } from 'next/server';
import { publishMessage } from '@/lib/sns';
// POST /api/notifications/send  (admin only)
// body: { subject: string, message: string }
export async function POST(req) {
  try {
    // Basic admin session check via cookie
    const cookies = req.headers.get("cookie") || "";
    const hasSession = cookies.includes("admin_session=");
    if (!hasSession) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { subject, message } = await req.json();
    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: 'subject and message are required' },
        { status: 400 }
      );
    }

    const topicArn = process.env.AWS_SNS_TOPIC_ARN;
    if (!topicArn) {
      return NextResponse.json(
        { success: false, message: 'AWS_SNS_TOPIC_ARN is not configured' },
        { status: 500 }
      );
    }

    const messageId = await publishMessage(topicArn, subject, message);
    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
