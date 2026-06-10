import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    hero: {
      title: "Say GoodBye to high medicine prices",
      subtitle: "Compare prices and save up to 51%",
      bannerImage: "https://assets.truemeds.in/Images/website-assets/images/home-banner/home-banner-desktop.png",
      phone: "09240250346",
      badge: "India's #1 Online Pharmacy",
      code: "FIRST25",
    },

    banners: [
      {
        id: 1,
        title: "Flat 25% Off",
        subtitle: "On your first medicine order",
        buttonText: "ORDER NOW",
        gradient: "from-blue-500 to-blue-700",
        tag: "First Order",
      },
      {
        id: 2,
        title: "Free Delivery",
        subtitle: "On orders above ₹500",
        buttonText: "SHOP NOW",
        gradient: "from-[#00a8e1] to-[#0090cc]",
        tag: "Free Shipping",
      },
      {
        id: 3,
        title: "Lab Tests",
        subtitle: "Save up to 70% on diagnostic tests",
        buttonText: "BOOK NOW",
        gradient: "from-emerald-500 to-teal-600",
        tag: "New",
      },
      {
        id: 4,
        title: "Generic Medicines",
        subtitle: "Same formula, up to 80% cheaper",
        buttonText: "EXPLORE",
        gradient: "from-violet-500 to-purple-700",
        tag: "Best Value",
      },
    ],

    categories: [
      {
        name: "Medicines",
        discount: "Up to 50% off",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
        href: "/categories/medicines",
        color: "bg-blue-50",
      },
      {
        name: "Personal Care",
        discount: "Up to 20% off",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
        href: "/categories/personal-care",
        color: "bg-pink-50",
      },
      {
        name: "Vitamins & Supplements",
        discount: "Up to 40% off",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
        href: "/categories/vitamins-supplements",
        color: "bg-amber-50",
      },
      {
        name: "Diabetes Care",
        discount: "Up to 30% off",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
        href: "/categories/diabetes-care",
        color: "bg-emerald-50",
      },
      {
        name: "Healthcare Devices",
        discount: "Up to 25% off",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
        href: "/categories/healthcare-devices",
        color: "bg-violet-50",
      },
      {
        name: "Homeopathic Medicine",
        discount: "Up to 15% off",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
        href: "/categories/homeopathic-medicine",
        color: "bg-teal-50",
      },
    ],

    popularItems: [
      {
        id: 101, name: "Neurobion Forte Tablet 30", brand: "Merck",
        mrp: 47, price: 40, discount: "15% OFF",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
        href: "/categories/medicines",
      },
      {
        id: 102, name: "Cetaphil Moisturising Cream 80gm", brand: "Cetaphil",
        mrp: 669, price: 602, discount: "10% OFF",
        image: "https://assets.truemeds.in/Images/ProductImage/TM-COOM1-002559/cetaphil-moisturising-cream-80gm--TM-COOM1-002559_1.png",
        href: "/categories/personal-care",
      },
      {
        id: 103, name: "Sunban Soft SPF 50+ Gel 75gm", brand: "Sunban",
        mrp: 990, price: 851, discount: "14% OFF",
        image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-001955/sunban-soft-sunscreen-spf-50-gel-75gm_sunban-soft-sunscreen-spf-50-gel-75gm--TM-GEEL1-001955_1.png",
        href: "/categories/personal-care",
      },
      {
        id: 104, name: "Liv 52 DS Tablet 60", brand: "Himalaya",
        mrp: 199, price: 159, discount: "20% OFF",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
        href: "/categories/vitamins-supplements",
      },
      {
        id: 105, name: "Becosules Capsule 20", brand: "Pfizer",
        mrp: 54, price: 43, discount: "20% OFF",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
        href: "/categories/medicines",
      },
      {
        id: 106, name: "Cipcal 500 Tablet 15", brand: "Cipla",
        mrp: 108, price: 54, discount: "50% OFF",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
        href: "/categories/medicines",
      },
    ],

    deals: [
      {
        id: 201, name: "Telma 40 Tablet 10", brand: "Glenmark",
        mrp: 145, price: 102, discount: "30% OFF", subSave: "68%",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
        href: "/categories/medicines",
      },
      {
        id: 202, name: "Glycomet 500 Tablet 20", brand: "USV",
        mrp: 37, price: 29, discount: "20% OFF", subSave: "72%",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220522992_125.png",
        href: "/categories/medicines",
      },
      {
        id: 203, name: "Pan 40 Tablet 15", brand: "Alkem",
        mrp: 107, price: 64, discount: "40% OFF",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220590032_127.png",
        href: "/categories/medicines",
      },
      {
        id: 204, name: "Atorva 10 Tablet 10", brand: "Zydus",
        mrp: 89, price: 53, discount: "40% OFF", subSave: "65%",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
        href: "/categories/medicines",
      },
      {
        id: 205, name: "Diataal Nutripop Diabetes Nutrition", brand: "USV",
        mrp: 214, price: 132, discount: "38% OFF",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
        href: "/categories/diabetes-care",
      },
      {
        id: 206, name: "Fericip XT Tablet 10", brand: "Cipla",
        mrp: 126, price: 63, discount: "50% OFF",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
        href: "/categories/vitamins-supplements",
      },
    ],

    newArrivals: [
      {
        id: 301, name: "Skinshine SPF 30 Sunscreen 100ml", brand: "Cadila",
        mrp: 239, price: 215, discount: "10% OFF",
        image: "https://assets.truemeds.in/Images/ProductImage/TM-LOES1-001196/skinshine-spf-30-sunscreen-lotion-100ml_skinshine-spf-30-sunscreen-lotion-100ml--TM-LOES1-001196_1.png",
        href: "/categories/personal-care",
      },
      {
        id: 302, name: "Ahaglow Advanced Face Wash 200gm", brand: "Ahaglow",
        mrp: 798, price: 678, discount: "15% OFF",
        image: "https://assets.truemeds.in/Images/ProductImage/TM-FASH1-000152/ahaglow-advanced-face-wash-200gm_ahaglow-advanced-face-wash-200gm--TM-FASH1-000152_1.png",
        href: "/categories/personal-care",
      },
      {
        id: 303, name: "Photostable Gold SPF 55 Sunscreen 50gm", brand: "Photostable",
        mrp: 945, price: 756, discount: "20% OFF",
        image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-002134/photostable-gold-spf-55-pa-matte-finish-sunscreen-gel-50gm_image_1.png",
        href: "/categories/personal-care",
      },
      {
        id: 304, name: "Lupical D3 Capsule 4", brand: "Lupin",
        mrp: 96, price: 48, discount: "50% OFF",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220598279_128.png",
        href: "/categories/vitamins-supplements",
      },
      {
        id: 305, name: "Zincovit Tablet 15", brand: "Apex",
        mrp: 99, price: 79, discount: "20% OFF",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1698220496491_124.png",
        href: "/categories/vitamins-supplements",
      },
      {
        id: 306, name: "Mederma Advanced Plus Scar Gel 10gm", brand: "Mederma",
        mrp: 530, price: 461, discount: "13% OFF",
        image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-001959/new-mederma-advanced-plus-scar-gel-10gm_new-mederma-advanced-plus-scar-gel-10gm--TM-GEEL1-001959_1.png",
        href: "/categories/personal-care",
      },
    ],

    articles: [
      {
        id: 1, tag: "Skin Care",
        title: "Best Sunscreens for Indian Skin: Dermatologist Guide 2025",
        excerpt: "Protect your skin from UVA/UVB damage with these top-rated sunscreens. We compared SPF 30 to SPF 50+ options for every skin type.",
        readTime: "4 min read",
        image: "https://assets.truemeds.in/Images/ProductImage/TM-GEEL1-001955/sunban-soft-sunscreen-spf-50-gel-75gm_sunban-soft-sunscreen-spf-50-gel-75gm--TM-GEEL1-001955_1.png",
      },
      {
        id: 2, tag: "Diabetes",
        title: "Managing Blood Sugar: A Complete Guide for Diabetics",
        excerpt: "Learn how to effectively manage your blood sugar levels with lifestyle changes, medication, and regular monitoring.",
        readTime: "5 min read",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1756443365418_123.png",
      },
      {
        id: 3, tag: "Vitamins",
        title: "Vitamin D Deficiency: Signs, Causes and Treatment",
        excerpt: "Vitamin D deficiency is more common than you think. Find out the warning signs and how to fix it with the right supplements.",
        readTime: "6 min read",
        image: "https://assets.truemeds.in/Images/HomepageImage/Picture_1741163760626_122.png",
      },
    ],

    testimonials: [
      {
        id: 1, name: "Priya Sharma", location: "Mumbai", rating: 5,
        text: "I save so much money every month using generic substitutes. My doctor approved all of them and they work just as well!",
      },
      {
        id: 2, name: "Rajesh Kumar", location: "Delhi", rating: 5,
        text: "Fast delivery, great prices, and the medicines are genuine. I've been ordering my diabetes medications here for 6 months.",
      },
      {
        id: 3, name: "Sunita Patel", location: "Bangalore", rating: 5,
        text: "The substitute recommendations saved me ₹800 on a single order! Amazing service and very user-friendly.",
      },
    ],

    faqs: [
      {
        q: "Are substitute medicines safe to use?",
        a: "Yes, substitute medicines (generics) contain the same active ingredients as branded medicines and are approved by the FDA/CDSCO. They are equally effective and safe, just more affordable.",
      },
      {
        q: "How much can I save with generic medicines?",
        a: "You can save anywhere from 20% to 80% by choosing substitute medicines over branded ones. The exact savings depend on the specific medicine.",
      },
      {
        q: "How do I upload my prescription?",
        a: "You can upload your prescription through the website. Simply click 'Upload Prescription', take a photo of your prescription, and our pharmacists will verify and prepare your order.",
      },
      {
        q: "What is the delivery time?",
        a: "We deliver medicines within 24-48 hours in most cities. For urgent orders, express delivery is also available.",
      },
      {
        q: "Do you offer free delivery?",
        a: "Yes, we offer free delivery on orders above ₹500. For orders below ₹500, a nominal delivery fee of ₹49 applies.",
      },
    ],

    stats: [
      { label: "Happy Customers", value: "5M+" },
      { label: "Cities Covered",  value: "1000+" },
      { label: "Total Savings",   value: "₹300Cr+" },
      { label: "Medicines",       value: "2.2L+" },
    ],
  };

  return NextResponse.json(data);
}
