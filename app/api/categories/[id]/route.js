import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

function badId(id) {
  if (!id || !mongoose.isValidObjectId(id))
    return NextResponse.json({ success: false, message: `Invalid category ID: "${id}"` }, { status: 400 });
  return null;
}

// PUT /api/categories/[id]
export async function PUT(req, { params }) {
  try {
    const { id } = await params;          // ← must await in Next 15
    const guard = badId(id);
    if (guard) return guard;

    await dbConnect();
    const body = await req.json();

    if (Array.isArray(body.subcategories)) {
      body.subcategories = body.subcategories.map((s) => s.trim()).filter(Boolean);
    }

    // Use $set explicitly so only the supplied fields are touched
    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;          // ← must await in Next 15
    const guard = badId(id);
    if (guard) return guard;

    await dbConnect();
    const permanent = new URL(req.url).searchParams.get('permanent') === 'true';

    if (permanent) {
      const deleted = await Category.findByIdAndDelete(id);
      if (!deleted)
        return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Deleted permanently.' }, { status: 200 });
    }

    const trashed = await Category.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!trashed)
      return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });

    return NextResponse.json({ success: true, data: trashed, message: 'Moved to trash.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
