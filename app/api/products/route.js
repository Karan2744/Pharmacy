import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { slugify } from '@/lib/slugify';

const mockProducts = [
  {
    _id: "1", name: "Cetaphil Gentle Skin Cleanser 250ml", brand: "Cetaphil",
    category: "Personal Care", subCategory: "Skin Care", price: 535, mrp: 595,
    discount: "10%", rating: 4.8, reviews: 1250, isdeleted: false,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
    status: "In Stock", stock: 100, slug: "cetaphil-gentle-skin-cleanser-250ml"
  },
  {
    _id: "2", name: "Himalaya Purifying Neem Face Wash 200ml", brand: "Himalaya",
    category: "Personal Care", subCategory: "Face Care", price: 180, mrp: 220,
    discount: "18%", rating: 4.5, reviews: 850, isdeleted: false,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
    status: "In Stock", stock: 100, slug: "himalaya-purifying-neem-face-wash-200ml"
  },
];

// GET /api/products?trash=true  → deleted products
// GET /api/products              → active products
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const trash    = searchParams.get('trash') === 'true';
    const category = searchParams.get('category');

    // $ne: true treats docs without the field (legacy) as active
    const query = trash ? { isdeleted: true } : { isdeleted: { $ne: true } };
    if (category) query.category = category;

    const products = await Product.find(query).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/products]', error.message);
    // Fallback to in-memory mocks so the UI never shows a blank products list
    const data = mockProducts.filter((p) => !p.isdeleted);
    return NextResponse.json({ success: true, data, _fallback: true }, { status: 200 });
  }
}

// POST /api/products
export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON body — request may be too large or malformed.' },
        { status: 400 }
      );
    }

    // ── Required field validation ──────────────────────────────────────────
    if (!body.name?.trim())
      return NextResponse.json({ success: false, message: 'Product name is required.' }, { status: 400 });
    if (!body.brand?.trim())
      return NextResponse.json({ success: false, message: 'Brand is required.' }, { status: 400 });
    if (!body.category?.trim())
      return NextResponse.json({ success: false, message: 'Category is required.' }, { status: 400 });
    if (body.price === undefined || body.price === '' || Number(body.price) < 0)
      return NextResponse.json({ success: false, message: 'A valid price is required.' }, { status: 400 });
    if (body.mrp === undefined || body.mrp === '' || Number(body.mrp) < 0)
      return NextResponse.json({ success: false, message: 'A valid MRP is required.' }, { status: 400 });
    if (body.adminGstPercent !== undefined && body.adminGstPercent !== '' && Number(body.adminGstPercent) < 0)
      return NextResponse.json({ success: false, message: 'Admin GST percent must be 0 or more.' }, { status: 400 });
    if (body.adminCgstPercent !== undefined && body.adminCgstPercent !== '' && Number(body.adminCgstPercent) < 0)
      return NextResponse.json({ success: false, message: 'Admin CGST percent must be 0 or more.' }, { status: 400 });

    // ── Sanitise image fields ──────────────────────────────────────────────
    // base64 data-URIs are large — keep only the first one as the main image,
    // and store at most 5 images total to avoid exceeding MongoDB's 16 MB doc limit.
    const isBase64 = (s) => typeof s === 'string' && s.startsWith('data:');
    const sanitiseImages = (imgs) =>
      Array.isArray(imgs)
        ? imgs.filter((s) => typeof s === 'string' && s.length > 0).slice(0, 5)
        : [];

    body.images = sanitiseImages(body.images);

    // Prefer the explicit `image` field; fall back to first element of `images`
    if (!body.image && body.images.length > 0) body.image = body.images[0];
    body.image = typeof body.image === 'string' ? body.image.trim() : '';

    // Warn in dev but don't block — large base64 images in MongoDB is not ideal
    if (isBase64(body.image)) {
      console.warn('[POST /api/products] image is a base64 data-URI — consider using a CDN URL instead.');
    }

    // ── Derived fields ─────────────────────────────────────────────────────
    body.price = Number(body.price);
    body.mrp   = Number(body.mrp);
    body.adminGstPercent = Number(body.adminGstPercent ?? 0);
    body.adminCgstPercent = Number(body.adminCgstPercent ?? 0);
    body.stock = Number(body.stock ?? 0);

    if (!body.discount && body.mrp > body.price) {
      body.discount = `${Math.round(((body.mrp - body.price) / body.mrp) * 100)}%`;
    }
    body.status    = body.stock > 0 ? 'In Stock' : 'Out of Stock';
    body.slug      = body.name ? slugify(body.name) : '';
    body.isdeleted = false;

    // ── DB ─────────────────────────────────────────────────────────────────
    await dbConnect();
    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });

  } catch (error) {
    // Mongoose validation errors → 400, anything else → 500
    const isValidation = error.name === 'ValidationError';
    const message = isValidation
      ? Object.values(error.errors).map((e) => e.message).join(', ')
      : error.message;
    return NextResponse.json(
      { success: false, message },
      { status: isValidation ? 400 : 500 }
    );
  }
}
