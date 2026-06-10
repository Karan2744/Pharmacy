import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true },
    value: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings ||
  mongoose.model('SiteSettings', SiteSettingsSchema);
