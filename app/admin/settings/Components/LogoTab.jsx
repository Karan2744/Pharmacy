"use client";

import { useRef, useState } from "react";

import LogoCard from "@/app/admin/Components/settings/LogoCard";
import SaveButton from "@/app/admin/Components/settings/SaveButton";
import useSettings from "@/hooks/useSettings";
import { saveSetting } from "@/services/settingsService";

export default function LogoTab({ showToast }) {
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const { logoUrl, setLogoUrl, logoPreview, setLogoPreview } = useSettings();

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await saveSetting("logoUrl", logoUrl);
      showToast("Logo saved");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <LogoCard
        logoUrl={logoUrl}
        logoPreview={logoPreview}
        setLogoUrl={setLogoUrl}
        setLogoPreview={setLogoPreview}
        fileRef={fileRef}
      />
      <div className="flex justify-end">
        <SaveButton saving={saving} />
      </div>
    </form>
  );
}
