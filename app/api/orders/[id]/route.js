import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { publishSMS } from '@/lib/sns';

function badId(id) {
  if (!id || !mongoose.isValidObjectId(id))
    return NextResponse.json({ success: false, message: `Invalid order ID: "${id}"` }, { status: 400 });
  return null;
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const guard = badId(id);
    if (guard) return guard;

    await dbConnect();
    const { status } = await req.json();

    const validStatuses = ['Processing', 'Dispatched', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const phone = order.address?.phone;
    if (phone) {
      const smsMap = {
        Processing: `PharmaCare: Your order #${order._id} is being processed.`,
        Dispatched: `PharmaCare: Your order #${order._id} has been dispatched! Delivery expected in 2-3 days.`,
        Delivered: `PharmaCare: Your order #${order._id} has been delivered. Thank you for shopping with us!`,
        Cancelled: `PharmaCare: Your order #${order._id} has been cancelled. Contact support for help.`,
      };
      publishSMS(phone, smsMap[status]).catch((err) =>
        console.error('SNS SMS failed:', err.message)
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const guard = badId(id);
    if (guard) return guard;

    await dbConnect();
    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
