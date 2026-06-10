"use client";

import { useState } from "react";

import SiteNameCard from "@/app/admin/Components/settings/SiteNameCard";
import SaveButton from "@/app/admin/Components/settings/SaveButton";
import useSettings from "@/hooks/useSettings";
import { saveSetting } from "@/services/settingsService";

export default function SettingsTab({ showToast }) {
  const [saving, setSaving] = useState(false);
  const { siteName, setSiteName } = useSettings();

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await saveSetting("siteName", siteName);
      showToast("Settings saved");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <SiteNameCard siteName={siteName} setSiteName={setSiteName} />
      <div className="flex justify-end">
        <SaveButton saving={saving} />
      </div>
    </form>
  );
}
