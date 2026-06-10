import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { slugify } from '@/lib/slugify';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Expected a non-empty array of products.' },
        { status: 400 }
      );
    }

    const docs = body.map((p) => {
      const price = Number(p.price) || 0;
      const mrp = Number(p.mrp) || price;
      const stock = Number(p.stock) ?? 0;
      const disc = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

      return {
        name: String(p.name || '').trim(),
        brand: String(p.brand || '').trim(),
        category: String(p.category || 'Personal Care').trim(),
        subCategory: String(p.subCategory || p.subcategory || '').trim(),
        price,
        mrp,
        stock,
        discount: disc ? `${disc}%` : '0%',
        status: stock > 0 ? 'In Stock' : 'Out of Stock',
        image: String(p.image || '').trim() ||
          'https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png',
        slug: p.name ? slugify(String(p.name)) : '',
      };
    });

    // Filter rows with at minimum a name
    const valid = docs.filter((d) => d.name);

    if (valid.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid rows found. Each row must have a name.' },
        { status: 400 }
      );
    }

    const inserted = await Product.insertMany(valid, { ordered: false });
    return NextResponse.json(
      { success: true, count: inserted.length, data: inserted },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
