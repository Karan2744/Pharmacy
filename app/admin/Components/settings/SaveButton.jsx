import { Save, Loader2 } from "lucide-react";

export default function SaveButton({
    saving,
}) {
    return (
        <button 
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl">
            {saving ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Save size={16} />
            
            )}

            {saving ? "Saving..." : "Save Settngs"}
        </button>
    )
}