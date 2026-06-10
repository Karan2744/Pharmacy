import dbConnect   from '@/lib/mongodb';
import Pincode     from '@/models/Pincode';
import { NextResponse } from 'next/server';

// GET /api/pincodes/check?pincode=401209
// Returns: { available: true/false, pincode, city, state, deliveryDays, message }
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get('pincode')?.trim() || '';

  if (!pin)
    return NextResponse.json({ available: false, message: 'Pincode is required.' }, { status: 400 });

  if (!/^\d{6}$/.test(pin))
    return NextResponse.json({ available: false, message: 'Please enter a valid 6-digit pincode.' }, { status: 400 });

  try {
    await dbConnect();
    const doc = await Pincode.findOne({ pincode: pin });

    if (!doc)
      return NextResponse.json({
        available: false,
        pincode: pin,
        message: `Sorry, delivery is not available to pincode ${pin} yet.`,
      }, { status: 200 });

    if (!doc.isActive)
      return NextResponse.json({
        available: false,
        pincode: pin,
        city:  doc.city,
        state: doc.state,
        message: `Delivery to ${pin}${doc.city ? ` (${doc.city})` : ''} is temporarily unavailable.`,
      }, { status: 200 });

    return NextResponse.json({
      available:    true,
      pincode:      pin,
      city:         doc.city,
      state:        doc.state,
      deliveryDays: doc.deliveryDays,
      message:      `Delivery available! Estimated ${doc.deliveryDays} day${doc.deliveryDays > 1 ? 's' : ''}${doc.city ? ` to ${doc.city}` : ''}.`,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ available: false, message: 'Unable to check pincode. Please try again.' }, { status: 500 });
  }
}
