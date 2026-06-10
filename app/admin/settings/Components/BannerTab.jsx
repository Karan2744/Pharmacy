"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";

import SaveButton from "@/app/admin/Components/settings/SaveButton";
import { getSettings, saveSetting } from "@/services/settingsService";

export default function BannerTab({ showToast }) {
  const [saving, setSaving] = useState(false);
  const [bannerImage, setBannerImage] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");

  useEffect(() => {
    getSettings().then((d) => {
      if (d.success) {
        setBannerImage(d.data.bannerImage || "");
        setBannerTitle(d.data.bannerTitle || "");
        setBannerSubtitle(d.data.bannerSubtitle || "");
      }
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await Promise.all([
        saveSetting("bannerImage", bannerImage),
        saveSetting("bannerTitle", bannerTitle),
        saveSetting("bannerSubtitle", bannerSubtitle),
      ]);
      showToast("Banner saved");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-md">
            <ImagePlus size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hero Banner</h2>
            <p className="text-sm text-gray-500">Edit the main banner shown on the homepage</p>
          </div>
        </div>

        {bannerImage && (
          <div className="mb-6 relative h-40 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <Image
              src={bannerImage}
              alt="Banner preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image URL
            </label>
            <input
              type="text"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition"
              placeholder="https://example.com/banner.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition"
              placeholder="e.g. Say GoodBye to high medicine prices"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
            <input
              type="text"
              value={bannerSubtitle}
              onChange={(e) => setBannerSubtitle(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition"
              placeholder="e.g. Compare prices and save up to 51%"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton saving={saving} />
      </div>
    </form>
  );
}
