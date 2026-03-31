import React, { useMemo } from "react";

const AvailabilityBadge = ({ availability }) => {
    const { label, isFuture } = useMemo(() => {
        const rows = availability || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let availLabel = "Available now";
        let future = false;

        const availableRows = rows.filter(r => r.status === "available");
        if (availableRows.length > 0) {
            availableRows.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            const slot = availableRows[0];
            const start = new Date(slot.start_date);
            if (start > today) {
                const opts = { day: "numeric", month: "long" };
                availLabel = `Available from ${start.toLocaleDateString("en-GB", opts)}`;
                future = true;
            }
        }

        return { label: availLabel, isFuture: future };
    }, [availability]);

    return (
        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border ${isFuture
            ? "bg-amber-50 border-amber-50 text-amber-600"
            : "bg-green-50 border-green-100 text-green-600"
            }`}>
            <div className="relative flex items-center justify-center w-2 h-2 mr-1">
                <span className={`absolute w-full h-full rounded-full animate-ping opacity-40 ${isFuture ? "bg-amber-500" : "bg-emerald-500"}`} />
                <span className={`relative block w-2 h-2 rounded-full ${isFuture ? "bg-amber-500" : "bg-emerald-500"} shadow-sm`} />
            </div>
            {label}
        </span>
    );
};

export default React.memo(AvailabilityBadge);
