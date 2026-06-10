import dbConnect   from '@/lib/mongodb';
import Pincode     from '@/models/Pincode';
import { NextResponse } from 'next/server';

// GET /api/pincodes  → list all pincodes
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const query  = search ? { pincode: { $regex: search } } : {};
    const pincodes = await Pincode.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: pincodes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/pincodes  → add one or bulk
// body: { pincode, city, state, deliveryDays, note }  OR  { pincodes: ['401209','401210',...] }
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // ── Bulk add ────────────────────────────────────────────────────────────
    if (Array.isArray(body.pincodes)) {
      const items = body.pincodes.map((item) => {
        if (typeof item === 'string') {
          return {
            pincode: String(item).trim(),
            city: '',
            state: '',
            deliveryDays: 2,
            note: '',
          };
        }

        return {
          pincode: String(item.pincode || item.pin || item.code || '').trim(),
          city: String(item.city || '').trim(),
          state: String(item.state || '').trim(),
          deliveryDays: Number(item.deliveryDays || item.delivery || item['delivery days'] || 2),
          note: String(item.note || '').trim(),
        };
      }).filter((item) => /^\d{6}$/.test(item.pincode));

      if (!items.length) return NextResponse.json({ success: false, message: 'No valid 6-digit pincodes provided.' }, { status: 400 });

      const uniqueItems = [];
      const seen = new Set();
      for (const item of items) {
        if (seen.has(item.pincode)) continue;
        seen.add(item.pincode);
        uniqueItems.push(item);
      }

      const ops = uniqueItems.map((item) => ({
        updateOne: {
          filter: { pincode: item.pincode },
          update: {
            $set: {
              city:         item.city,
              state:        item.state,
              deliveryDays: item.deliveryDays || 2,
              isActive:     true,
              note:         item.note,
            },
          },
          upsert: true,
        },
      }));
      const result = await Pincode.bulkWrite(ops);
      return NextResponse.json({
        success:  true,
        message:  `${result.upsertedCount} added, ${result.modifiedCount} updated.`,
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
      }, { status: 201 });
    }

    // ── Single add ──────────────────────────────────────────────────────────
    const { pincode, city = '', state = '', deliveryDays = 2, note = '', isActive = true } = body;
    if (!pincode || !/^\d{6}$/.test(String(pincode).trim()))
      return NextResponse.json({ success: false, message: 'A valid 6-digit pincode is required.' }, { status: 400 });

    const existing = await Pincode.findOne({ pincode: String(pincode).trim() });
    if (existing)
      return NextResponse.json({ success: false, message: `Pincode ${pincode} already exists.` }, { status: 409 });

    const doc = await Pincode.create({ pincode: String(pincode).trim(), city, state, deliveryDays, note, isActive });
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    if (error.code === 11000)
      return NextResponse.json({ success: false, message: 'Pincode already exists.' }, { status: 409 });
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
