import React, { useMemo } from 'react';
import { TrendingDown, MapPin, Sparkles, DoorOpen } from 'lucide-react';

const WishlistInsights = ({ wishlist }) => {
    if (!wishlist || wishlist.length < 2) return null;

    const insights = useMemo(() => {
        const list = [];

        // Best Value (Lowest Price)
        const withPrice = wishlist.filter(p => p.price > 0);
        if (withPrice.length > 0) {
            const bestValue = [...withPrice].sort((a, b) => a.price - b.price)[0];
            list.push({
                icon: <TrendingDown size={18} className="text-[#16a34a]" />,
                title: "Best Value",
                desc: (
                    <span>
                        At <span className="font-bold">€{Math.round(bestValue.price).toLocaleString()}/mo</span>, <span className="italic">{bestValue.title}</span> is your most affordable option.
                    </span>
                ),
                bg: "bg-[#22C55E]/5",
                border: "border-[#22C55E]/15"
            });
        }

        // Most Units Available
        const withUnits = wishlist.filter(p => (p.availableUnits || 0) > 0);
        if (withUnits.length > 0) {
            const most = [...withUnits].sort((a, b) => b.availableUnits - a.availableUnits)[0];
            list.push({
                icon: <DoorOpen size={18} className="text-[#0f4c3a]" />,
                title: "Most Available",
                desc: (
                    <span>
                        <span className="italic">{most.title}</span> has <span className="font-bold">{most.availableUnits} {most.availableUnits === 1 ? 'unit' : 'units'}</span> free right now.
                    </span>
                ),
                bg: "bg-[#0f4c3a]/5",
                border: "border-[#0f4c3a]/10"
            });
        }

        // City Pattern
        const cities = {};
        wishlist.forEach(p => { cities[p.city] = (cities[p.city] || 0) + 1; });
        const topCity = Object.keys(cities).reduce((a, b) => cities[a] > cities[b] ? a : b);

        if (cities[topCity] > 1) {
            list.push({
                icon: <MapPin size={18} className="text-[#374151]" />,
                title: "City Vibes",
                desc: (
                    <span>
                        {cities[topCity]} of your saves are in <span className="font-bold">{topCity}</span>. You know what you like!
                    </span>
                ),
                bg: "bg-white",
                border: "border-[#e5e7eb]"
            });
        } else {
            list.push({
                icon: <Sparkles size={18} className="text-[#D4A017]" />,
                title: "Diverse Taste",
                desc: "You're exploring properties across different cities. Great strategy!",
                bg: "bg-white",
                border: "border-[#e5e7eb]"
            });
        }

        return list;
    }, [wishlist]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((insight, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${insight.border} ${insight.bg} flex items-start gap-3`}>
                    <div className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-sm shrink-0 border border-[#e5e7eb]">
                        {insight.icon}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[#111827] mb-0.5">{insight.title}</h4>
                        <p className="text-xs text-[#6b7280] leading-relaxed">{insight.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WishlistInsights;
