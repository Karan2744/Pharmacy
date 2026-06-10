import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      name: { type: String, required: true },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: { type: String, required: true },
        brand: { type: String },
        price: { type: Number, required: true },
        mrp: { type: Number },
        quantity: { type: Number, required: true, default: 1 },
        image: { type: String },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 49,
    },
    address: {
      fullName: { type: String },
      phone: { type: String },
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    status: {
      type: String,
      enum: ['Processing', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery',
    },
    taxableAmount: { type: Number, default: 0 },
    cgst:          { type: Number, default: 0 },
    sgst:          { type: Number, default: 0 },
    gstTotal:      { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
