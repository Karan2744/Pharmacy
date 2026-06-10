import dbConnect   from '@/lib/mongodb';
import Pincode     from '@/models/Pincode';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

function badId(id) {
  if (!id || !mongoose.isValidObjectId(id))
    return NextResponse.json({ success: false, message: `Invalid ID: "${id}"` }, { status: 400 });
  return null;
}

// DELETE /api/pincodes/[id]
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const guard = badId(id);
    if (guard) return guard;
    await dbConnect();
    const deleted = await Pincode.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Pincode not found.' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Pincode deleted.' });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

// PUT /api/pincodes/[id]  → toggle isActive or update fields
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const guard = badId(id);
    if (guard) return guard;
    await dbConnect();
    const body = await req.json();
    const updated = await Pincode.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Pincode not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
