"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/services/settingsService";

export default function useSettings() {
    const [siteName, setSiteName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [logoPreview, setLogoPreview] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSettings()
        .then((d) => {
            if(d.success) {
                setSiteName(d.data.siteName || " ");
                setLogoUrl(d.data.logoUrl || "");
                setLogoPreview(d.data.logoUrl || "");
            }
        })
        .finally(() => setLoading(false));
    }, []);

    return {
        siteName,
    setSiteName,
    logoUrl,
    setLogoUrl,
    logoPreview,
    setLogoPreview,
    loading
    };
}

