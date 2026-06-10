import mongoose from 'mongoose';

const SafetyItemSchema = new mongoose.Schema({
  level:  { type: String, default: 'consult' }, // safe | moderate | unsafe | consult
  advice: { type: String, default: '' },
}, { _id: false });

const FAQSchema = new mongoose.Schema({
  question: { type: String, default: '' },
  answer:   { type: String, default: '' },
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this product.'],
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand for this product.'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category for this product.'],
  },
  subCategory:   { type: String, default: '' },
  price:         { type: Number, required: [true, 'Please provide a price for this product.'] },
  mrp:           { type: Number, required: [true, 'Please provide an MRP for this product.'] },
  adminGstPercent: { type: Number, default: 0 },
  adminCgstPercent: { type: Number, default: 0 },
  slug:          { type: String, index: true },
  discount:      { type: String },
  rating:        { type: Number, default: 4.5 },
  reviews:       { type: Number, default: 0 },
  image:         { type: String, default: '' },
  images:        { type: [String], default: [] },
  stock:         { type: Number, default: 0 },
  status:        { type: String, default: 'In Stock' },
  isdeleted:     { type: Boolean, default: false },

  // ── Medicine-specific fields ──────────────────────────────────────────────
  saltComposition:     { type: String, default: '' },  // e.g. "Glucosamine (500mg) + Chondroitin (400mg)"
  packSize:            { type: String, default: '' },  // e.g. "Strip of 10 Tablets"
  prescriptionRequired:{ type: Boolean, default: false },
  manufacturer:        { type: String, default: '' },  // separate from brand/marketer
  storageInfo:         { type: String, default: 'Store below 30°C in a cool, dry place away from direct sunlight.' },

  // ── Drug information ──────────────────────────────────────────────────────
  aboutDrug:           { type: String, default: '' },
  howItWorks:          { type: String, default: '' },
  usesText:            { type: [String], default: [] },
  sideEffectsText:     { type: [String], default: [] },
  howToUseText:        { type: [String], default: [] },
  drugInteractions:    { type: [String], default: [] },
  highlightsText:      { type: [String], default: [] },

  // ── Safety advice ─────────────────────────────────────────────────────────
  safetyAdvice: {
    alcohol:   { type: SafetyItemSchema, default: () => ({}) },
    pregnancy: { type: SafetyItemSchema, default: () => ({}) },
    lactation: { type: SafetyItemSchema, default: () => ({}) },
    driving:   { type: SafetyItemSchema, default: () => ({}) },
    kidney:    { type: SafetyItemSchema, default: () => ({}) },
    liver:     { type: SafetyItemSchema, default: () => ({}) },
  },

  // ── FAQs ─────────────────────────────────────────────────────────────────
  faqs: { type: [FAQSchema], default: [] },

}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
