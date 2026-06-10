import dbConnect      from '@/lib/mongodb';
import SiteSettings   from '@/models/SiteSettings';
import { NextResponse } from 'next/server';

const DEFAULTS = {
  logoUrl:  '',
  siteName: 'Maurya Pharmacy',
  logoText: 'Maurya Pharmacy',
};

// GET /api/settings  → { success, data: { logoUrl, siteName, ... } }
export async function GET() {
  try {
    await dbConnect();
    const docs = await SiteSettings.find({});
    const data = { ...DEFAULTS };
    docs.forEach((d) => { data[d.key] = d.value; });
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json({ success: true, data: DEFAULTS }, { status: 200 });
  }
}

// PUT /api/settings  body: { key, value }
export async function PUT(req) {
  try {
    await dbConnect();
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ success: false, message: 'key is required' }, { status: 400 });

    const doc = await SiteSettings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, data: doc }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
