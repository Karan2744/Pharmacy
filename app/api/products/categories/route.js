import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    const categories = await Product.distinct('category');
    const loadedCategories = (categories || []).filter(Boolean).sort();

    const categoryGroups = await Product.aggregate([
      { $match: { category: { $nin: [null, ''] } } },
      {
        $group: {
          _id: { category: '$category', subCategory: '$subCategory' },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          subCategories: { $addToSet: '$_id.subCategory' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const subcategoriesByCategory = categoryGroups.reduce((acc, item) => {
      const subs = (item.subCategories || []).filter(Boolean).sort();
      acc[item._id] = subs;
      return acc;
    }, {});

    return NextResponse.json(
      {
        success: true,
        data: {
          categories: loadedCategories,
          subcategoriesByCategory,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
