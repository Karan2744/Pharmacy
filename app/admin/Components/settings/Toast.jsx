import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Toast({ toast }) {
  if (!toast) return null;

  const ok = toast.type !== "error";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white border border-gray-100 shadow-xl rounded-2xl px-5 py-4 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            ok ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {ok ? (
            <CheckCircle2 size={18} className="text-green-500" />
          ) : (
            <AlertCircle size={18} className="text-red-500" />
          )}
        </div>

        <div>
          <p className="font-bold">{ok ? "Saved" : "Error"}</p>
          <p className="text-xs text-gray-500">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}