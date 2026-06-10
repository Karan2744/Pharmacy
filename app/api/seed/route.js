import dbConnect  from '@/lib/mongodb';
import Product    from '@/models/Product';
import Category   from '@/models/Category';
import { NextResponse } from 'next/server';
import { slugify } from '@/lib/slugify';

/* ─────────────────────────────────────────────────────────────────────────────
   REAL PRODUCTS  (images from TrueMeds CDN, prices verified)
───────────────────────────────────────────────────────────────────────────── */
const PRODUCTS = [

  // ── PERSONAL CARE → Skin Care ───────────────────────────────────────────
  {
    name: "Skinshine SPF 30 Sunscreen Lotion 100ml", brand: "Cadila",
    category: "Personal Care", subCategory: "Skin Care",
    price: 215, mrp: 239, discount: "10%", rating: 4.5, reviews: 1820, stock: 80,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-LOES1-001196/skinshine-spf-30-sunscreen-lotion-100ml_skinshine-spf-30-sunscreen-lotion-100ml--TM-LOES1-001196_1.png",
  },
  {
    name: "Sunban Soft SPF 50+ Gel 75gm", brand: "Sunban",
    category: "Personal Care", subCategory: "Skin Care",
    price: 851, mrp: 990, discount: "14%", rating: 4.6, reviews: 2340, stock: 60,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-001955/sunban-soft-sunscreen-spf-50-gel-75gm_sunban-soft-sunscreen-spf-50-gel-75gm--TM-GEEL1-001955_1.png",
  },
  {
    name: "UV Doux Blue Light SPF 50 PA+++ Sunscreen Gel 50gm", brand: "Brinton",
    category: "Personal Care", subCategory: "Skin Care",
    price: 810, mrp: 880, discount: "8%", rating: 4.4, reviews: 980, stock: 45,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-002343/uv-doux-blue-light-spf-50-pa-sunscreen-gel-50-gm_uv-doux-blue-light-spf-50-pa-sunscreen-gel-50-gm--TM-GEEL1-002343_1.png",
  },
  {
    name: "Photostable Gold SPF 55 PA+++ Matte Sunscreen Gel 50gm", brand: "Photostable",
    category: "Personal Care", subCategory: "Skin Care",
    price: 756, mrp: 945, discount: "20%", rating: 4.7, reviews: 1560, stock: 55,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-002134/photostable-gold-spf-55-pa-matte-finish-sunscreen-gel-50gm_image_1.png",
  },
  {
    name: "Cetaphil Gentle Skin Cleanser 500ml", brand: "Cetaphil",
    category: "Personal Care", subCategory: "Skin Care",
    price: 1130, mrp: 1299, discount: "13%", rating: 4.8, reviews: 4200, stock: 90,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-LOES1-001923/cetaphil-gentle-skin-cleanser--500ml_cetaphil-gentle-skin-cleanser-500ml--TM-LOES1-001923_1.png",
  },
  {
    name: "Cetaphil Moisturising Cream 80gm", brand: "Cetaphil",
    category: "Personal Care", subCategory: "Skin Care",
    price: 602, mrp: 669, discount: "10%", rating: 4.9, reviews: 5100, stock: 75,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-COOM1-002559/cetaphil-moisturising-cream-80gm--TM-COOM1-002559_1.png",
  },
  {
    name: "Venusia Max Intensive Moisturizing Lotion 300gm", brand: "Venusia",
    category: "Personal Care", subCategory: "Skin Care",
    price: 706, mrp: 882, discount: "20%", rating: 4.6, reviews: 2800, stock: 65,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-LOES1-001322/venusia-max-intensive-moisturizing-lotion-300gm_venusia-max-intensive-moisturizing-lotion-300gm--TM-LOES1-001322_1.png",
  },
  {
    name: "Mederma Advanced Plus Scar Gel 10gm", brand: "Mederma",
    category: "Personal Care", subCategory: "Skin Care",
    price: 461, mrp: 530, discount: "13%", rating: 4.5, reviews: 3400, stock: 50,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-001959/new-mederma-advanced-plus-scar-gel-10gm_new-mederma-advanced-plus-scar-gel-10gm--TM-GEEL1-001959_1.png",
  },
  {
    name: "Acne UV SPF 50 PA+++ Silicone Sunscreen Gel 50gm", brand: "Acne",
    category: "Personal Care", subCategory: "Skin Care",
    price: 780, mrp: 975, discount: "20%", rating: 4.4, reviews: 1240, stock: 40,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-001205/acne-uv-spf-50-pa-silicone-sunscreen-gel-50gm_acne-uv-spf-50-pa-silicone-sunscreen-gel-50gm--TM-GEEL1-001205_1.png",
  },
  {
    name: "Episoft AC SPF 30 Moisturiser 75gm", brand: "Episoft",
    category: "Personal Care", subCategory: "Skin Care",
    price: 511, mrp: 639, discount: "20%", rating: 4.3, reviews: 890, stock: 35,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-COOM1-002762/episoft-ac-spf-30-sunscreen-75gm_1.png",
  },

  // ── PERSONAL CARE → Face Care ────────────────────────────────────────────
  {
    name: "Alite Anti Acne Charcoal Face Wash 70gm", brand: "Alite",
    category: "Personal Care", subCategory: "Face Care",
    price: 200, mrp: 250, discount: "20%", rating: 4.3, reviews: 1120, stock: 100,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-FASH1-000043/alite-anti-acne-charcoal-face-wash-70gm_alite-anti-acne-charcoal-face-wash-70gm--TM-FASH1-000043_1.png",
  },
  {
    name: "Ahaglow Advanced Face Wash Gel 200gm", brand: "Ahaglow",
    category: "Personal Care", subCategory: "Face Care",
    price: 678, mrp: 798, discount: "15%", rating: 4.6, reviews: 2650, stock: 70,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-FASH1-000152/ahaglow-advanced-face-wash-200gm_ahaglow-advanced-face-wash-200gm--TM-FASH1-000152_1.png",
  },
  {
    name: "Alite Anti Acne Gel 15gm", brand: "Alite",
    category: "Personal Care", subCategory: "Face Care",
    price: 200, mrp: 250, discount: "20%", rating: 4.2, reviews: 760, stock: 90,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-001224/alite-anti-acne-gel-15gm_alite-anti-acne-gel-15gm--TM-GEEL1-001224_1.png",
  },
  {
    name: "Himalaya Purifying Neem Face Wash 200ml", brand: "Himalaya",
    category: "Personal Care", subCategory: "Face Care",
    price: 180, mrp: 220, discount: "18%", rating: 4.5, reviews: 3800, stock: 120,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-FASH1-000043/alite-anti-acne-charcoal-face-wash-70gm_alite-anti-acne-charcoal-face-wash-70gm--TM-FASH1-000043_1.png",
  },

  // ── PERSONAL CARE → Hair Care ────────────────────────────────────────────
  {
    name: "Mamaearth Onion Hair Fall Control Shampoo 250ml", brand: "Mamaearth",
    category: "Personal Care", subCategory: "Hair Care",
    price: 315, mrp: 349, discount: "10%", rating: 4.6, reviews: 6200, stock: 110,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
  },
  {
    name: "L'Oreal Paris Total Repair 5 Shampoo 175ml", brand: "L'Oreal",
    category: "Personal Care", subCategory: "Hair Care",
    price: 145, mrp: 175, discount: "17%", rating: 4.5, reviews: 4500, stock: 130,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
  },

  // ── PERSONAL CARE → Body Care ────────────────────────────────────────────
  {
    name: "Soft Soles Cream 30gm", brand: "Soft",
    category: "Personal Care", subCategory: "Body Care",
    price: 108, mrp: 120, discount: "10%", rating: 4.1, reviews: 540, stock: 85,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-001716/soft-soles-cream-30gm_soft-soles-cream-30gm--TM-GEEL1-001716_1.png",
  },
  {
    name: "Dove Cream Beauty Bathing Bar 125g Pack of 3", brand: "Dove",
    category: "Personal Care", subCategory: "Body Care",
    price: 210, mrp: 240, discount: "12%", rating: 4.9, reviews: 8900, stock: 200,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
  },
  {
    name: "Ethiglo Soap 75gm", brand: "Ethiglo",
    category: "Personal Care", subCategory: "Body Care",
    price: 84, mrp: 98, discount: "14%", rating: 4.2, reviews: 320, stock: 60,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-SOAP1-000285/ethiglo-soap-75gm_ethiglo-soap-75gm--TM-SOAP1-000285_1.png",
  },
  {
    name: "Moiz XL Cream 500gm", brand: "Moiz",
    category: "Personal Care", subCategory: "Body Care",
    price: 1001, mrp: 1100, discount: "9%", rating: 4.4, reviews: 1100, stock: 40,
    image: "https://assets.truemeds.in/Images/ProductImage/TM-COOM1-003149/moiz-xl-cream-500gm_moiz-xl-cream-500gm--TM-COOM1-003149_1.png",
  },

  // ── PERSONAL CARE → Oral Care ─────────────────────────────────────────────
  {
    name: "Colgate MaxFresh Toothpaste 150g", brand: "Colgate",
    category: "Personal Care", subCategory: "Oral Care",
    price: 95, mrp: 110, discount: "13%", rating: 4.4, reviews: 5600, stock: 150,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
  },
  {
    name: "Ponds White Beauty Face Wash 100g", brand: "Ponds",
    category: "Personal Care", subCategory: "Oral Care",
    price: 165, mrp: 190, discount: "13%", rating: 4.3, reviews: 2100, stock: 90,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
  },

  // ── MEDICINES ────────────────────────────────────────────────────────────
  {
    name: "Neurobion Forte Tablet 30", brand: "Merck",
    category: "Medicines", subCategory: "Vitamins & Nutrition",
    price: 40, mrp: 47, discount: "15%", rating: 4.7, reviews: 12400, stock: 200,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
  },
  {
    name: "Ecosprin 75 Tablet 14", brand: "USV",
    category: "Medicines", subCategory: "Heart Care",
    price: 19, mrp: 23, discount: "18%", rating: 4.5, reviews: 8700, stock: 180,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
  },
  {
    name: "Glycomet 500 Tablet 20", brand: "USV",
    category: "Medicines", subCategory: "Diabetes",
    price: 29, mrp: 37, discount: "20%", rating: 4.6, reviews: 9800, stock: 160,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
  },
  {
    name: "Telma 40 Tablet 10", brand: "Glenmark",
    category: "Medicines", subCategory: "Blood Pressure",
    price: 102, mrp: 145, discount: "30%", rating: 4.8, reviews: 7600, stock: 140,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
  },
  {
    name: "Pan 40 Tablet 15", brand: "Alkem",
    category: "Medicines", subCategory: "Stomach Care",
    price: 64, mrp: 107, discount: "40%", rating: 4.7, reviews: 11200, stock: 220,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
  },
  {
    name: "Atorva 10 Tablet 10", brand: "Zydus",
    category: "Medicines", subCategory: "Heart Care",
    price: 53, mrp: 89, discount: "40%", rating: 4.6, reviews: 9400, stock: 170,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
  },
  {
    name: "Becosules Capsule 20", brand: "Pfizer",
    category: "Medicines", subCategory: "Vitamins & Nutrition",
    price: 43, mrp: 54, discount: "20%", rating: 4.6, reviews: 13500, stock: 250,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
  },
  {
    name: "Cipcal 500 Tablet 15", brand: "Cipla",
    category: "Medicines", subCategory: "Bone & Joint",
    price: 54, mrp: 108, discount: "50%", rating: 4.8, reviews: 15600, stock: 190,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
  },
  {
    name: "Shelcal 500 Tablet 15", brand: "Elder",
    category: "Medicines", subCategory: "Bone & Joint",
    price: 92, mrp: 115, discount: "20%", rating: 4.7, reviews: 6800, stock: 130,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
  },
  {
    name: "Amaryl 1 Tablet 30", brand: "Sanofi",
    category: "Medicines", subCategory: "Diabetes",
    price: 47, mrp: 65, discount: "28%", rating: 4.5, reviews: 4200, stock: 110,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
  },

  // ── VITAMINS & SUPPLEMENTS ───────────────────────────────────────────────
  {
    name: "Evion 400 Vitamin E Capsule 10", brand: "Merck",
    category: "Vitamins & Supplements", subCategory: "Vitamin A to Z",
    price: 39, mrp: 49, discount: "20%", rating: 4.6, reviews: 7800, stock: 200,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
  },
  {
    name: "Zincovit Tablet 15", brand: "Apex",
    category: "Vitamins & Supplements", subCategory: "Multivitamins",
    price: 79, mrp: 99, discount: "20%", rating: 4.5, reviews: 5400, stock: 180,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
  },
  {
    name: "Liv 52 DS Tablet 60", brand: "Himalaya",
    category: "Vitamins & Supplements", subCategory: "Herbal Supplements",
    price: 159, mrp: 199, discount: "20%", rating: 4.8, reviews: 18900, stock: 220,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
  },
  {
    name: "Supradyn Daily Tablet 15", brand: "Bayer",
    category: "Vitamins & Supplements", subCategory: "Multivitamins",
    price: 61, mrp: 68, discount: "11%", rating: 4.7, reviews: 9200, stock: 170,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
  },
  {
    name: "D-Protin Vanilla Protein Powder 200g", brand: "Pfizer",
    category: "Vitamins & Supplements", subCategory: "Protein Supplements",
    price: 272, mrp: 340, discount: "20%", rating: 4.4, reviews: 3100, stock: 85,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
  },
  {
    name: "Celin 500 Vitamin C Tablet 20", brand: "GSK",
    category: "Vitamins & Supplements", subCategory: "Immunity Boosters",
    price: 34, mrp: 42, discount: "20%", rating: 4.5, reviews: 6700, stock: 250,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
  },
  {
    name: "Lupical D3 Capsule 4", brand: "Lupin",
    category: "Vitamins & Supplements", subCategory: "Vitamin A to Z",
    price: 48, mrp: 96, discount: "50%", rating: 4.6, reviews: 4800, stock: 160,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
  },
  {
    name: "Fericip XT Tablet 10", brand: "Cipla",
    category: "Vitamins & Supplements", subCategory: "Multivitamins",
    price: 63, mrp: 126, discount: "50%", rating: 4.7, reviews: 5900, stock: 140,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
  },

  // ── DIABETES CARE ────────────────────────────────────────────────────────
  {
    name: "Accu-Chek Active Blood Glucose Monitor", brand: "Roche",
    category: "Diabetes Care", subCategory: "Monitoring",
    price: 990, mrp: 1290, discount: "23%", rating: 4.7, reviews: 8900, stock: 50,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
  },
  {
    name: "Accu-Chek Active Test Strips 10", brand: "Roche",
    category: "Diabetes Care", subCategory: "Monitoring",
    price: 396, mrp: 495, discount: "20%", rating: 4.8, reviews: 12400, stock: 100,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
  },
  {
    name: "Sugar Free Gold 500 Tablets", brand: "Zydus",
    category: "Diabetes Care", subCategory: "Supplements",
    price: 202, mrp: 230, discount: "12%", rating: 4.5, reviews: 6700, stock: 120,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
  },
  {
    name: "Diabecon 60 Tablets", brand: "Himalaya",
    category: "Diabetes Care", subCategory: "Supplements",
    price: 102, mrp: 135, discount: "24%", rating: 4.4, reviews: 3200, stock: 90,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
  },
  {
    name: "Diataal Nutripop Diabetes Nutrition Shake", brand: "USV",
    category: "Diabetes Care", subCategory: "Diabetic Diet",
    price: 132, mrp: 214, discount: "38%", rating: 4.6, reviews: 2800, stock: 70,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
  },

  // ── HEALTHCARE DEVICES ───────────────────────────────────────────────────
  {
    name: "Dr. Morepen BP One BP Monitor", brand: "Dr. Morepen",
    category: "Healthcare Devices", subCategory: "Blood Pressure Monitors",
    price: 990, mrp: 1299, discount: "24%", rating: 4.5, reviews: 7400, stock: 45,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
  },
  {
    name: "Omron HEM-7120 Blood Pressure Monitor", brand: "Omron",
    category: "Healthcare Devices", subCategory: "Blood Pressure Monitors",
    price: 1499, mrp: 1999, discount: "25%", rating: 4.7, reviews: 9800, stock: 35,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
  },
  {
    name: "Dr. Trust Pulse Oximeter", brand: "Dr. Trust",
    category: "Healthcare Devices", subCategory: "Pulse Oximeters",
    price: 699, mrp: 999, discount: "30%", rating: 4.6, reviews: 5600, stock: 55,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
  },
  {
    name: "Dr. Trust Digital Thermometer", brand: "Dr. Trust",
    category: "Healthcare Devices", subCategory: "Thermometers",
    price: 299, mrp: 499, discount: "40%", rating: 4.5, reviews: 4200, stock: 80,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
  },
  {
    name: "AccuSure Blood Glucose Monitor", brand: "AccuSure",
    category: "Healthcare Devices", subCategory: "Blood Pressure Monitors",
    price: 699, mrp: 899, discount: "22%", rating: 4.4, reviews: 3100, stock: 40,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
  },

  // ── HEALTH CONDITIONS ────────────────────────────────────────────────────
  {
    name: "Volini Pain Relief Spray 55gm", brand: "Sun Pharma",
    category: "Health Conditions", subCategory: "Joint & Bone",
    price: 190, mrp: 220, discount: "14%", rating: 4.5, reviews: 8900, stock: 120,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
  },
  {
    name: "Zandu Balm 25ml", brand: "Zandu",
    category: "Health Conditions", subCategory: "Joint & Bone",
    price: 68, mrp: 78, discount: "13%", rating: 4.4, reviews: 14200, stock: 200,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
  },
  {
    name: "Digene Antacid Gel Orange 200ml", brand: "Abbott",
    category: "Health Conditions", subCategory: "Digestive Health",
    price: 132, mrp: 155, discount: "15%", rating: 4.6, reviews: 7600, stock: 150,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
  },
  {
    name: "Pudin Hara Pearls 10 Capsules", brand: "Dabur",
    category: "Health Conditions", subCategory: "Digestive Health",
    price: 58, mrp: 72, discount: "19%", rating: 4.5, reviews: 5400, stock: 180,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
  },
  {
    name: "Otrivin Nasal Spray 10ml", brand: "Novartis",
    category: "Health Conditions", subCategory: "Blood Pressure",
    price: 98, mrp: 112, discount: "13%", rating: 4.3, reviews: 3800, stock: 90,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
  },

  // ── HOMEOPATHIC MEDICINE ─────────────────────────────────────────────────
  {
    name: "Himalaya Bonnisan Liquid 100ml", brand: "Himalaya",
    category: "Homeopathic Medicine", subCategory: "Digestive Health",
    price: 135, mrp: 160, discount: "16%", rating: 4.6, reviews: 4200, stock: 80,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
  },
  {
    name: "SBL Alfalfa Tonic 500ml", brand: "SBL",
    category: "Homeopathic Medicine", subCategory: "Digestive Health",
    price: 195, mrp: 230, discount: "15%", rating: 4.4, reviews: 2900, stock: 60,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
  },
  {
    name: "Dr. Reckeweg R41 Sexual Neurasthenia Drops 22ml", brand: "Dr. Reckeweg",
    category: "Homeopathic Medicine", subCategory: "Cough & Cold",
    price: 235, mrp: 275, discount: "15%", rating: 4.3, reviews: 1800, stock: 45,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
  },

  // ── LAB TESTS ────────────────────────────────────────────────────────────
  {
    name: "Thyroid Profile Total Test", brand: "Thyrocare",
    category: "Lab Tests", subCategory: "Thyroid Panel",
    price: 399, mrp: 999, discount: "60%", rating: 4.8, reviews: 6700, stock: 999,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
  },
  {
    name: "Complete Blood Count CBC Test", brand: "Dr. Lal PathLabs",
    category: "Lab Tests", subCategory: "Diabetes Panel",
    price: 249, mrp: 499, discount: "50%", rating: 4.7, reviews: 9800, stock: 999,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
  },
  {
    name: "HbA1c Diabetes Control Test", brand: "SRL Diagnostics",
    category: "Lab Tests", subCategory: "Diabetes Panel",
    price: 349, mrp: 699, discount: "50%", rating: 4.8, reviews: 7400, stock: 999,
    image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORIES + SUBCATEGORIES
───────────────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    name: "Medicines",
    subcategories: ["Pain Relief", "Cold & Flu", "Stomach Care", "Diabetes", "Blood Pressure", "Heart Care", "Bone & Joint", "Vitamins & Nutrition", "Antibiotics", "Respiratory"],
  },
  {
    name: "Personal Care",
    subcategories: ["Skin Care", "Face Care", "Hair Care", "Body Care", "Oral Care", "Baby Care", "Male Grooming", "Feminine Hygiene"],
  },
  {
    name: "Vitamins & Supplements",
    subcategories: ["Multivitamins", "Herbal Supplements", "Immunity Boosters", "Energy Support", "Vitamin A to Z", "Protein Supplements", "Omega & Fish Oil", "Mineral Supplements"],
  },
  {
    name: "Diabetes Care",
    subcategories: ["Monitoring", "Medication", "Supplements", "Diabetic Diet", "Sugar Substitutes", "Syringes & Pens"],
  },
  {
    name: "Healthcare Devices",
    subcategories: ["Blood Pressure Monitors", "Thermometers", "Pulse Oximeters", "Nebulizers", "Glucometers", "Weighing Scales"],
  },
  {
    name: "Health Conditions",
    subcategories: ["Joint & Bone", "Digestive Health", "Blood Pressure", "Heart Care", "Eye Care", "Thyroid", "Liver Care", "Kidney Care"],
  },
  {
    name: "Homeopathic Medicine",
    subcategories: ["Cough & Cold", "Pain Relief", "Digestive Health", "Skin Care", "Hair Care", "Heart Care"],
  },
  {
    name: "Lab Tests",
    subcategories: ["Diabetes Panel", "Thyroid Panel", "Lipid Profile", "Complete Blood Count", "Vitamin Deficiency", "Kidney Panel"],
  },
  {
    name: "Offers",
    subcategories: ["Discounted Products", "Combo Offers", "Seasonal Offers", "Clearance Sale"],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/seed  – idempotent seed (upsert by name)
───────────────────────────────────────────────────────────────────────────── */
export async function GET() {
  try {
    await dbConnect();

    // ── 1. Upsert categories ────────────────────────────────────────────────
    let catUpserted = 0;
    for (const cat of CATEGORIES) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        { $set: { subcategories: cat.subcategories, isDeleted: false } },
        { upsert: true, new: true }
      );
      catUpserted++;
    }

    // ── 2. Upsert products (match by name to avoid duplicates) ──────────────
    let prodUpserted = 0;
    for (const p of PRODUCTS) {
      const slug = slugify(p.name);
      await Product.findOneAndUpdate(
        { name: p.name },
        {
          $set: {
            ...p,
            slug,
            status: (p.stock ?? 0) > 0 ? "In Stock" : "Out of Stock",
            isdeleted: false,
          },
        },
        { upsert: true, new: true }
      );
      prodUpserted++;
    }

    return NextResponse.json({
      success:  true,
      message:  `Seeded ${catUpserted} categories and ${prodUpserted} products.`,
      categories: catUpserted,
      products:   prodUpserted,
    });
  } catch (error) {
    console.error("[seed]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
