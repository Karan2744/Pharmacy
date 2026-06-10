import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';

const SEED = [
  { name: 'Medicines',               subcategories: ['Pain Relief', 'Cold & Flu', 'Stomach Care', 'Diabetes Care', 'Respiratory'] },
  { name: 'Personal Care',           subcategories: ['Skin Care', 'Face Care', 'Hair Care', 'Body Care', 'Oral Care'] },
  { name: 'Health Conditions',       subcategories: ['Diabetes', 'Blood Pressure', 'Thyroid', 'Digestive Health', 'Joint & Bone'] },
  { name: 'Vitamins & Supplements',  subcategories: ['Multivitamins', 'Herbal Supplements', 'Immunity Boosters', 'Energy Support'] },
  { name: 'Diabetes Care',           subcategories: ['Monitoring', 'Medication', 'Supplements'] },
  { name: 'Healthcare Devices',      subcategories: ['Blood Pressure Monitors', 'Thermometers', 'Pulse Oximeters'] },
  { name: 'Homeopathic Medicine',    subcategories: ['Cough & Cold', 'Pain Relief', 'Digestive Health'] },
  { name: 'Lab Tests',               subcategories: ['Diabetes Panel', 'Thyroid Panel', 'Lipid Profile'] },
  { name: 'Offers',                  subcategories: ['Discounted Products', 'Combo Offers', 'Seasonal Offers'] },
];

// GET /api/categories
export async function GET() {
  try {
    await dbConnect();

    // ── Remove duplicates that crept in from concurrent seed runs ────────────
    const all = await Category.find({}).sort({ createdAt: 1 }); // oldest first
    const seen = new Map(); // name → first _id
    const dupIds = [];
    for (const doc of all) {
      if (seen.has(doc.name)) {
        dupIds.push(doc._id);
      } else {
        seen.set(doc.name, doc._id);
      }
    }
    if (dupIds.length > 0) {
      await Category.deleteMany({ _id: { $in: dupIds } });
    }

    // ── Seed on first run using upsert (never creates duplicates) ────────────
    let docs = await Category.find({}).sort({ name: 1 });
    if (docs.length === 0) {
      await Promise.all(
        SEED.map((s) =>
          Category.updateOne(
            { name: s.name },
            { $setOnInsert: s },
            { upsert: true }
          )
        )
      );
      docs = await Category.find({}).sort({ name: 1 });
    }

    return NextResponse.json({ success: true, data: docs }, { status: 200 });
  } catch {
    const mock = SEED.map((s, i) => ({
      _id: String(i + 1),
      ...s,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    }));
    return NextResponse.json({ success: true, data: mock }, { status: 200 });
  }
}

// POST /api/categories
export async function POST(req) {
  try {
    await dbConnect();
    const { name, subcategories = [] } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required.' },
        { status: 400 }
      );
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Category already exists.' },
        { status: 409 }
      );
    }

    const cat = await Category.create({
      name: name.trim(),
      subcategories: subcategories.map((s) => s.trim()).filter(Boolean),
      isDeleted: false,
    });

    return NextResponse.json({ success: true, data: cat }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
