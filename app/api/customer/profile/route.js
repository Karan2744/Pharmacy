import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { verifyToken } from "@/lib/jwt";

async function getCustomerFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  return payload?.id || null;
}

export async function GET(request) {
  try {
    const id = await getCustomerFromRequest(request);
    if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const customer = await Customer.findById(id);
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const id = await getCustomerFromRequest(request);
    if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email } = await request.json();

    await connectDB();
    const customer = await Customer.findByIdAndUpdate(
      id,
      { ...(name !== undefined && { name }), ...(email !== undefined && { email }) },
      { new: true }
    );

    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json({ success: true, customer });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
