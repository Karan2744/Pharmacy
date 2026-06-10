import mongoose from 'mongoose';

const PincodeSchema = new mongoose.Schema(
  {
    pincode:      { type: String, required: true, unique: true, trim: true, match: /^\d{6}$/ , default: '400001'},
    city:         { type: String, default: '', trim: true, default: 'Mumbai' },
    state:        { type: String, default: '', trim: true, default: 'Maharashtra' },
    deliveryDays: { type: Number, default: 2, min: 1, max: 10 , default: 2},
    isActive:     { type: Boolean, default: true, index: false },
    note:         { type: String, default: '', trim: false },
    isDeleted:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

PincodeSchema.index({ pincode: 1 });

export default mongoose.models.Pincode || mongoose.model('Pincode', PincodeSchema);
