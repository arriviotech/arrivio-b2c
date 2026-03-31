import React, { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, Bed, Bath, Ruler, Trophy, Crown, Star, MapPin, DoorOpen } from "lucide-react";

const ComparisonView = ({ properties, onClose }) => {
    if (!properties || !Array.isArray(properties) || properties.length === 0) return null;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Parse area — handles number or range string like "20–35"
    const parseArea = (p) => {
        if (!p?.details) return 0;
        const val = p.details.size;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const parts = val.split(/[–-]/).map(s => parseInt(s.trim(), 10)).filter(Boolean);
            return parts.length > 0 ? Math.max(...parts) : 0;
        }
        return 0;
    };

    const formatArea = (p) => {
        if (!p?.details?.size) return "-";
        const val = p.details.size;
        return typeof val === 'number' ? `${val}` : `${val}`;
    };

    // Flatten amenities object { category: [names] } → array of names
    const getAmenityList = (p) => {
        if (!p?.amenities || typeof p.amenities !== 'object') return [];
        if (Array.isArray(p.amenities)) return p.amenities;
        return Object.values(p.amenities).flat();
    };

    const getBest = (key, type = "high") => {
        if (properties.length < 2) return null;
        const values = properties.map((p) => {
            if (!p) return 0;
            if (key === "price") return Number(p.price) || 0;
            if (key === "area") return parseArea(p);
            if (key === "beds") return Number(p.details?.beds) || 0;
            if (key === "units") return Number(p.unitCount) || 0;
            return 0;
        });
        const validValues = values.filter(v => typeof v === 'number' && !isNaN(v) && v > 0);
        if (validValues.length === 0) return 0;
        return type === "low" ? Math.min(...validValues) : Math.max(...validValues);
    };

    const bestPrice = getBest("price", "low");
    const bestArea = getBest("area", "high");
    const bestBeds = getBest("beds", "high");
    const bestUnits = getBest("units", "high");

    const winnerData = useMemo(() => {
        if (properties.length < 2) return null;
        const scores = properties.map(p => {
            let score = 0;
            const reasons = [];
            if (!p) return { id: "unknown", score: -1, reasons: [] };

            const price = Number(p.price) || 0;
            const area = parseArea(p);
            const beds = Number(p.details?.beds) || 0;
            const units = Number(p.unitCount) || 0;

            if (price === bestPrice && price > 0) { score += 20; reasons.push("Best Price"); }
            if (area === bestArea && area > 0) { score += 25; reasons.push("Most Spacious"); }
            if (beds === bestBeds && beds > 0) { score += 15; reasons.push("More Bedrooms"); }
            if (units === bestUnits && units > 0) { score += 10; reasons.push("More Units"); }

            return { id: p.id, score, reasons, title: p.title };
        });
        scores.sort((a, b) => b.score - a.score);
        return scores[0];
    }, [properties, bestPrice, bestArea, bestBeds, bestUnits]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-5 py-3 bg-white flex justify-between items-center border-b border-[#e5e7eb] shrink-0">
                    <h2 className="text-lg font-serif text-[#111827]">Compare Properties</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#f2f2f2] transition text-[#111827]"><X size={16} /></button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto p-3">
                    <div className="min-w-max">
                        <div
                            className="grid gap-x-2 gap-y-0"
                            style={{ gridTemplateColumns: `100px repeat(${properties.length}, minmax(160px, 1fr))` }}
                        >
                            {/* Property Headers */}
                            <div className="pt-4 text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest text-right pr-2 self-end pb-2">
                                Property
                            </div>
                            {properties.map((p, i) => (
                                <div key={p.id || i} className={`relative flex flex-col gap-1.5 p-2 rounded-t-lg transition-colors ${winnerData?.id === p.id ? "bg-[#0f4c3a]/5 ring-1 ring-[#0f4c3a]/20 shadow-sm z-10" : ""}`}>
                                    {winnerData?.id === p.id && (
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#D4A017] text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md z-20 whitespace-nowrap">
                                            <Crown size={10} /> WINNER
                                        </div>
                                    )}
                                    <div className="mx-auto w-24 h-24 rounded-lg overflow-hidden bg-[#f2f2f2] shadow-inner">
                                        <img src={p.image || "/placeholder.jpg"} className="w-full h-full object-cover" alt="" onError={(e) => e.target.src = "https://placehold.co/300x200"} />
                                    </div>
                                    <div className="text-center px-0.5">
                                        <h3 className="font-serif text-base font-medium text-[#111827] leading-tight mb-0.5 line-clamp-2">{p.title}</h3>
                                        <p className="text-[10px] uppercase tracking-widest text-[#6b7280] flex items-center justify-center gap-0.5">
                                            <MapPin size={9} /> {p.city}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Price */}
                            <ComparisonLabel>Price</ComparisonLabel>
                            {properties.map((p, i) => {
                                const val = Number(p.price) || 0;
                                const isBest = val === bestPrice && val > 0;
                                return (
                                    <ComparisonCell key={p.id || i} isWinner={winnerData?.id === p.id} isBest={isBest} bestBg="bg-[#22C55E]/5">
                                        <span className={`font-serif text-xl ${isBest ? "text-[#16a34a] font-bold" : "text-[#111827]"}`}>
                                            €{val.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-[#9ca3af] ml-1">/mo</span>
                                        {isBest && <div className="ml-1.5 bg-[#16a34a] text-white p-0.5 rounded-full"><Check size={8} /></div>}
                                    </ComparisonCell>
                                );
                            })}

                            {/* Area */}
                            <ComparisonLabel>Area</ComparisonLabel>
                            {properties.map((p, i) => {
                                const val = parseArea(p);
                                const isBest = val === bestArea && val > 0;
                                return (
                                    <ComparisonCell key={p.id || i} isWinner={winnerData?.id === p.id} isBest={isBest}>
                                        <div className="flex items-baseline gap-1">
                                            <Ruler size={13} className="text-[#9ca3af]" />
                                            <span className={`text-base ${isBest ? "text-[#111827] font-bold" : "text-[#111827]"}`}>
                                                {formatArea(p)}
                                            </span>
                                            <span className="text-[10px] text-[#6b7280]">m²</span>
                                        </div>
                                        {isBest && <div className="ml-1.5 bg-[#16a34a] text-white p-0.5 rounded-full"><Check size={8} /></div>}
                                    </ComparisonCell>
                                );
                            })}

                            {/* Config: Beds + Baths */}
                            <ComparisonLabel>Config</ComparisonLabel>
                            {properties.map((p, i) => {
                                const beds = Number(p.details?.beds) || 0;
                                const baths = Number(p.details?.baths) || 0;
                                const isBest = beds === bestBeds && beds > 0;
                                return (
                                    <ComparisonCell key={p.id || i} isWinner={winnerData?.id === p.id} isBest={isBest}>
                                        <div className={`flex items-center gap-1 ${isBest ? "text-[#111827] font-bold" : "text-[#111827]"}`}>
                                            <Bed size={14} className="text-[#9ca3af]" />
                                            <span className="text-sm">{beds}</span>
                                        </div>
                                        <div className="w-px h-3 bg-[#e5e7eb] mx-1"></div>
                                        <div className="flex items-center gap-1 text-[#111827]">
                                            <Bath size={14} className="text-[#9ca3af]" />
                                            <span className="text-sm">{baths}</span>
                                        </div>
                                    </ComparisonCell>
                                );
                            })}

                            {/* Units */}
                            <ComparisonLabel>Units</ComparisonLabel>
                            {properties.map((p, i) => {
                                const total = Number(p.unitCount) || 0;
                                const available = Number(p.availableUnits) || 0;
                                const isBest = total === bestUnits && total > 0;
                                return (
                                    <ComparisonCell key={p.id || i} isWinner={winnerData?.id === p.id} isBest={isBest}>
                                        <DoorOpen size={14} className="text-[#9ca3af]" />
                                        <span className={`text-sm ${isBest ? "font-bold" : ""} text-[#111827]`}>{total} total</span>
                                        <span className="text-[10px] text-[#16a34a] font-medium ml-1">({available} free)</span>
                                    </ComparisonCell>
                                );
                            })}

                            {/* Highlights */}
                            <ComparisonLabel>Highlights</ComparisonLabel>
                            {properties.map((p, i) => (
                                <div key={p.id || i} className={`py-2 px-2 flex flex-wrap gap-1 justify-center content-start border-t border-[#e5e7eb] ${winnerData?.id === p.id ? "bg-[#0f4c3a]/5 ring-1 ring-[#0f4c3a]/20 rounded-b-lg border-t-transparent shadow-sm" : ""}`}>
                                    {getAmenityList(p).slice(0, 3).map((am, k) => (
                                        <span key={k} className="text-[9px] bg-[#f2f2f2] border border-[#e5e7eb] px-1.5 py-0.5 rounded text-[#374151] font-medium whitespace-nowrap">
                                            {am}
                                        </span>
                                    ))}
                                    {getAmenityList(p).length === 0 && (
                                        <span className="text-[10px] text-[#9ca3af]">No amenities listed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Verdict Footer */}
                {winnerData && winnerData.reasons.length > 0 && (
                    <div className="bg-[#0f4c3a] text-white px-5 py-2.5 shrink-0">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-[#D4A017] rounded-full text-[#111827] shadow-lg"><Trophy size={14} /></div>
                                <div>
                                    <h3 className="font-serif text-sm leading-none mb-0.5">
                                        <span className="text-[#D4A017] italic">{winnerData.title}</span> is the winner.
                                    </h3>
                                    <p className="text-[10px] text-white/60 font-light">
                                        Top in <span className="text-white/90 font-medium">{winnerData.reasons.join(", ")}</span>.
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-[#D4A017] border border-[#D4A017]/30 text-[9px] font-bold uppercase tracking-widest rounded-full transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const ComparisonLabel = ({ children }) => (
    <div className="py-2.5 text-[10px] font-bold text-[#374151] uppercase tracking-wide text-right pr-3 flex items-center justify-end border-t border-[#e5e7eb]">
        {children}
    </div>
);

const ComparisonCell = ({ children, isWinner, isBest, bestBg = "bg-[#f2f2f2]" }) => (
    <div className={`py-2 px-2 flex items-center justify-center gap-0.5 border-t border-[#e5e7eb] ${isWinner ? "bg-[#0f4c3a]/5 ring-x ring-[#0f4c3a]/20" : ""} ${isBest ? `${bestBg} rounded-md` : ""}`}>
        {children}
    </div>
);

export default ComparisonView;
