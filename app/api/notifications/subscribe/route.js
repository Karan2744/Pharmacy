import { NextResponse } from 'next/server';
import { getOrCreateTopic, subscribeEmail, subscribeSMS } from '@/lib/sns';

// POST /api/notifications/subscribe
// body: { type: "email"|"sms", endpoint: "email@example.com"|"+91XXXXXXXXXX" }
export async function POST(req) {
  try {
    const { type, endpoint } = await req.json();

    if (!type || !endpoint) {
      return NextResponse.json(
        { success: false, message: 'type and endpoint are required' },
        { status: 400 }
      );
    }

    const topicArn = process.env.AWS_SNS_TOPIC_ARN || await getOrCreateTopic('pharmacy-order-notifications');

    let subscriptionArn;
    if (type === 'email') {
      subscriptionArn = await subscribeEmail(topicArn, endpoint);
    } else if (type === 'sms') {
      subscriptionArn = await subscribeSMS(topicArn, endpoint);
    } else {
      return NextResponse.json(
        { success: false, message: 'type must be "email" or "sms"' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Subscribed. Check your inbox/phone to confirm.', subscriptionArn },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
