import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { slugify } from '@/lib/slugify';
import mongoose from 'mongoose';

// Local in-memory mock used when no MongoDB is configured (development).
const mockProducts = [
  { _id: '1', name: 'Mock Product 1', isdeleted: false },
  { _id: '2', name: 'Mock Product 2', isdeleted: false },
];

// ── Shared ID guard ────────────────────────────────────────────────────────────
function badId(id) {
  if (!id) {
    return NextResponse.json(
      { success: false, message: `Invalid product ID: "${id}"` },
      { status: 400 }
    );
  }

  // In production require a valid Mongo ObjectId. During development allow
  // simple numeric mock IDs (e.g. "1", "2") so local mock data can be used
  // without hitting the database.
  const allowNumericMock = process.env.NODE_ENV !== 'production';
  if (!mongoose.isValidObjectId(id)) {
    if (!allowNumericMock || !/^\d+$/.test(String(id))) {
      return NextResponse.json(
        { success: false, message: `Invalid product ID: "${id}"` },
        { status: 400 }
      );
    }
  }
  return null;
}

export async function POST(req) {
  console.log("Received POST /api/products request");
  
  try {
    // If no DB configured, use in-file mock storage for faster local development
    const body = await req.json();
    if (!process.env.MONGODB_URI) {
      const nextId = String(mockProducts.length + 1);
      if (!body.discount && body.mrp && body.price) {
        body.discount = `${Math.round(((body.mrp - body.price) / body.mrp) * 100)}%`;
      }
      if (body.stock !== undefined) {
        body.status = Number(body.stock) > 0 ? 'In Stock' : 'Out of Stock';
      }
      if (!body.image && Array.isArray(body.images) && body.images.length > 0) {
        body.image = body.images[0];
      }
      if (body.name) body.slug = slugify(body.name);

      const newProduct = {
        _id: nextId,
        name: body.name || 'Unnamed product',
        brand: body.brand || 'Unknown',
        category: body.category || 'Uncategorized',
        subCategory: body.subCategory || body.subcategory || 'General',
        price: body.price || 0,
        mrp: body.mrp || body.price || 0,
        discount: body.discount || '',
        rating: body.rating || 4.5,
        reviews: body.reviews || 0,
        isdeleted: false,
        image: body.image || (Array.isArray(body.images) && body.images[0]) || '',
        status: body.status || (body.stock > 0 ? 'In Stock' : 'Out of Stock'),
        stock: body.stock || 0,
        slug: body.slug || (body.name ? slugify(body.name) : nextId),
      };
      mockProducts.push(newProduct);
      return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
    }

    await dbConnect();
    if (!body.discount && body.mrp && body.price) {
      body.discount = `${Math.round(((body.mrp - body.price) / body.mrp) * 100)}%`;
    }
    if (body.stock !== undefined) {
      body.status = Number(body.stock) > 0 ? 'In Stock' : 'Out of Stock';
    }
    if (!body.image && Array.isArray(body.images) && body.images.length > 0) {
      body.image = body.images[0];
    }
    if (body.name) body.slug = slugify(body.name);

    body.isdeleted = false;

    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/products/[id]             → soft-delete  (isdeleted: true)
// DELETE /api/products/[id]?force=true  → permanent delete
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const guard = badId(id);
    if (guard) return guard;
    // Fast-path to in-memory mock when no DB configured
    const force = new URL(req.url).searchParams.get('force') === 'true';
    if (!process.env.MONGODB_URI) {
      const idx = mockProducts.findIndex((p) => p._id === String(id));
      if (idx === -1) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      if (force) {
        mockProducts.splice(idx, 1);
        return NextResponse.json({ success: true, message: 'Permanently deleted.' }, { status: 200 });
      }
      mockProducts[idx].isdeleted = true;
      return NextResponse.json({ success: true, message: 'Moved to trash.' }, { status: 200 });
    }

    await dbConnect();
    if (force) {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Permanently deleted.' }, { status: 200 });
    }

    // Soft delete — explicit $set required in Mongoose 9
    const product = await Product.findByIdAndUpdate(id, { $set: { isdeleted: true } });
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Moved to trash.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/products/[id]  → restore from trash  (isdeleted: false)
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const guard = badId(id);
    if (guard) return guard;

    if (!process.env.MONGODB_URI) {
      const idx = mockProducts.findIndex((p) => p._id === String(id));
      if (idx === -1) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      mockProducts[idx].isdeleted = false;
      return NextResponse.json({ success: true, message: 'Product restored.' }, { status: 200 });
    }

    await dbConnect();
    const product = await Product.findByIdAndUpdate(id, { $set: { isdeleted: false } });
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Product restored.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/products/[id]  → full update
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const guard = badId(id);
    if (guard) return guard;
    const body = await req.json();

    if (!process.env.MONGODB_URI) {
      const idx = mockProducts.findIndex((p) => p._id === String(id));
      if (idx === -1) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      // merge shallow
      mockProducts[idx] = { ...mockProducts[idx], ...body };
      return NextResponse.json({ success: true, data: mockProducts[idx] }, { status: 200 });
    }

    await dbConnect();

    if (body.stock !== undefined) {
      body.status = Number(body.stock) > 0 ? 'In Stock' : 'Out of Stock';
    }
    if (!body.image && Array.isArray(body.images) && body.images.length > 0) {
      body.image = body.images[0];
    }
    if (body.name) body.slug = slugify(body.name);

    await Product.findByIdAndUpdate(id, body, { runValidators: true });
    const updated = await Product.findById(id);

    if (!updated) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
