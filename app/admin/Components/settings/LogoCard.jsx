import Image from "next/image";

import {
    Upload,
    Trash2,
    ImageIcon,
} from "lucide-react";

export default function LogoCard({
    logoUrl,
    logoPreview,
    setLogoPreview,
    setLogoUrl,
    fileRef,
}) {
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        const response = await fetch('/api/settings/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            console.error('Logo upload failed', data?.message || response.statusText);
            return;
        }

        setLogoUrl(data.url);
        setLogoPreview(data.url);
    };

    const clearLogo = () => {
        setLogoUrl("");
        setLogoPreview("");

        if (fileRef.current) {
            fileRef.current.value = "";
        }
    };

    

    return (
   <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
  {/* Header */}
  <div className="flex items-center gap-4 mb-6">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
      <ImageIcon size={20} className="text-white" />
    </div>

    <div>
      <h2 className="text-lg font-bold text-gray-900">
        Brand Logo
      </h2>
      <p className="text-sm text-gray-500">
        Upload your company logo or provide an image URL
      </p>
    </div>
  </div>

  {/* Logo Preview */}
  <div className="mb-6">
    <div className="relative h-28 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden flex items-center justify-center">
      {logoPreview ? (
        <Image
          src={logoPreview}
          alt="Logo Preview"
          fill
          className="object-contain p-4"
          unoptimized={logoPreview?.startsWith("data:")}
        />
      ) : (
        <div className="text-center">
          <ImageIcon
            size={28}
            className="mx-auto text-gray-300 mb-2"
          />
          <p className="text-sm text-gray-400">
            No logo uploaded
          </p>
        </div>
      )}
    </div>

    {logoPreview && (
      <button
        type="button"
        onClick={clearLogo}
        className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition"
      >
        <Trash2 size={15} />
        Remove Logo
      </button>
    )}
  </div>

  {/* Upload Area */}
  <div
    onClick={() => fileRef.current?.click()}
    className="group border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:bg-purple-50/50"
  >
    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition">
      <Upload size={24} className="text-purple-600" />
    </div>

    <h3 className="font-semibold text-gray-800">
      Upload Logo
    </h3>

    <p className="text-sm text-gray-500 mt-1">
      Click to browse or drag & drop your image
    </p>

    <span className="inline-block mt-3 text-xs text-gray-400">
      PNG, JPG, SVG up to 5MB
    </span>
  </div>

  <input
    ref={fileRef}
    type="file"
    className="hidden"
    accept="image/*"
    onChange={handleFileChange}
  />

  {/* URL Input */}
  <div className="mt-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Logo URL
    </label>

    <input
      type="text"
      className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition"
      value={logoUrl || ""}
      placeholder="/logo/logo.png or https://example.com/logo.png"
      onChange={(e) => {
        setLogoUrl(e.target.value);
        setLogoPreview(e.target.value || "");
      }}
    />
  </div>
</div>
    )
}