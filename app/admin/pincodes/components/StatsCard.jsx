import { MapPin } from "lucide-react";

export default function StatsCards({
    total, 
    active, 
    inactive,
}) {
    const stats = [
        {
            label: "Total Pincodes",
            value: total,
        },
        {
            label: "Active",
            value: active, 
        },
        {
            label: "Inative",
            value: inactive
        },
    ]

    return (
        <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
                <div key={s.label}>
                    
                    </div>
                    ))}
        </div>
    );
}