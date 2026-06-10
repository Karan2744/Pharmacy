import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    if (!q.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    await dbConnect();

    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { subCategory: { $regex: q, $options: 'i' } },
      ],
    };
    if (category) query.category = category;

    const products = await Product.find(query).limit(30).lean();
    return NextResponse.json({ success: true, data: products, query: q });
  } catch (error) {
    // fallback mock
    return NextResponse.json({ success: true, data: [], query: '' });
  }
}
