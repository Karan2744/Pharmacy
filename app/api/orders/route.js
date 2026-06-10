import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import { publishMessage, publishSMS } from '@/lib/sns';

async function sendOrderNotification(order) {
  const topicArn = process.env.AWS_SNS_TOPIC_ARN;
  const itemList = order.items.map((i) => `  • ${i.name} x${i.quantity}`).join('\n');
  const subject = `New Order #${order._id} — ₹${order.total}`;
  const message = [
    `New order received on PharmaCare.`,
    `Order ID: ${order._id}`,
    `Customer: ${order.user?.name || 'Guest'} (${order.user?.email || ''})`,
    `Items:\n${itemList}`,
    `Total: ₹${order.total} (incl. ₹${order.shippingFee} shipping)`,
    `Payment: ${order.paymentMethod}`,
    `Status: ${order.status}`,
  ].join('\n');

  const phone = order.address?.phone;

  await Promise.all([
    topicArn ? publishMessage(topicArn, subject, message) : Promise.resolve(),
    phone ? publishSMS(phone, `PharmaCare: Order #${order._id} confirmed. Total: ₹${order.total}. We'll notify you on dispatch.`) : Promise.resolve(),
  ]);
}

const mockOrders = [
  {
    _id: "1",
    user: "guest",
    items: [
      { name: "Cetaphil Gentle Skin Cleanser", price: 535, quantity: 1 }
    ],
    total: 584,
    shippingFee: 49,
    status: "Pending",
    createdAt: new Date().toISOString()
  }
];

export async function GET(req) {
  try {
    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    console.log("MongoDB not available, returning mock orders");
    return NextResponse.json({ success: true, data: mockOrders }, { status: 200 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    if (!body.user || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, message: 'Order data is incomplete' }, { status: 400 });
    }

    const order = await Order.create({
      ...body,
      shippingFee: body.shippingFee ?? 49,
    });

    // Fire SNS notification — non-blocking, don't fail the order if it errors
    sendOrderNotification(order).catch((err) =>
      console.error('SNS notification failed:', err.message)
    );

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
