import { CheckCircle2, XCircle } from "lucide-react";

export default function Toast({ toast }) {
  if (!toast) return null;

  const ok = toast.type !== "error";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border min-w-[260px]
        ${
          ok
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        {ok ? (
          <CheckCircle2 size={18} />
        ) : (
          <XCircle size={18} />
        )}

        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
    </div>
  );
}