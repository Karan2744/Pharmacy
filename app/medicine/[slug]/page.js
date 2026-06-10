import dbConnect from '@/lib/mongodb';
import Product   from '@/models/Product';
import { notFound } from 'next/navigation';
import mongoose  from 'mongoose';
import { slugify } from '@/lib/slugify';
import ProductDetailClient from '@/components/ProductDetailClient';
import Link   from 'next/link';
import { ChevronRight } from 'lucide-react';

/* ── Resolve product from URL slug ─────────────────────────────────────── */
async function getProductBySlug(slug) {
  const s = String(slug || '').toLowerCase().trim();
  await dbConnect();

  if (mongoose.isValidObjectId(s)) {
    const p = await Product.findById(s).lean();
    if (p) return p;
  }

  const bySlug = await Product.findOne({ slug: s }).lean();
  if (bySlug) return bySlug;

  const last = s.split('-').pop();
  if (mongoose.isValidObjectId(last)) {
    const p = await Product.findById(last).lean();
    if (p) return p;
  }

  const all = await Product.find({}).lean();
  return all.find((p) => {
    const base = slugify(p.name);
    return s === base || s === `${base}-${p._id}` || p.slug === s;
  }) || null;
}

/* ── Related products (same sub-category, exclude self) ─────────────────── */
async function getRelated(product) {
  if (!product) return [];
  try {
    return await Product.find({
      _id:       { $ne: product._id },
      isdeleted: { $ne: true },
      $or: [
        { subCategory: product.subCategory },
        { category:    product.category },
      ],
    }).limit(12).lean();
  } catch { return []; }
}

/* ── Substitutes — same salt composition, different brand ────────────────── */
async function getSubstitutes(product) {
  if (!product?.saltComposition) return [];
  try {
    return await Product.find({
      _id:             { $ne: product._id },
      isdeleted:       { $ne: true },
      saltComposition: product.saltComposition,
    }).limit(8).lean();
  } catch { return []; }
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product  = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, substitutes] = await Promise.all([
    getRelated(product),
    getSubstitutes(product),
  ]);

  const p  = JSON.parse(JSON.stringify(product));
  const r  = JSON.parse(JSON.stringify(related));
  const su = JSON.parse(JSON.stringify(substitutes));

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto no-scrollbar">
          <Link href="/"       className="hover:text-[#0070B3] font-medium whitespace-nowrap">Home</Link>
          <ChevronRight size={11} />
          <Link href="/search" className="hover:text-[#0070B3] font-medium whitespace-nowrap">Medicines</Link>
          {p.category && (
            <>
              <ChevronRight size={11} />
              <Link href={`/categories/${slugify(p.category)}`} className="hover:text-[#0070B3] font-medium whitespace-nowrap">
                {p.category}
              </Link>
            </>
          )}
          {p.subCategory && (
            <>
              <ChevronRight size={11} />
              <Link
                href={`/categories/${slugify(p.category)}?sub=${encodeURIComponent(p.subCategory)}`}
                className="hover:text-[#0070B3] font-medium whitespace-nowrap"
              >
                {p.subCategory}
              </Link>
            </>
          )}
          <ChevronRight size={11} />
          <span className="text-gray-700 font-semibold truncate max-w-[200px]">{p.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <ProductDetailClient product={p} relatedProducts={r} substitutes={su} />
      </div>

    </main>
  );
}
