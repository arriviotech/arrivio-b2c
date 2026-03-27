import React from "react";
import {
    Wifi, Monitor, Armchair, Tv, Sparkles, Waves, Sofa,
    ArrowUpFromLine, Lock, Bike, Mail, Users, Car, Printer,
    Package, Wind, Utensils, Coffee, Shirt, Dumbbell, UserCheck,
    Sun, CheckCircle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const getAmenityIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("internet") || n.includes("wifi") || n.includes("fiber")) return <Wifi size={16} />;
    if (n.includes("monitor")) return <Monitor size={16} />;
    if (n.includes("chair") || n.includes("desk")) return <Armchair size={16} />;
    if (n.includes("tv")) return <Tv size={16} />;
    if (n.includes("cleaning")) return <Sparkles size={16} />;
    if (n.includes("washer") || n.includes("laundry")) return <Waves size={16} />;
    if (n.includes("furnished")) return <Sofa size={16} />;
    if (n.includes("elevator")) return <ArrowUpFromLine size={16} />;
    if (n.includes("secure")) return <Lock size={16} />;
    if (n.includes("bike")) return <Bike size={16} />;
    if (n.includes("mail")) return <Mail size={16} />;
    if (n.includes("meeting")) return <Users size={16} />;
    if (n.includes("parking")) return <Car size={16} />;
    if (n.includes("printer") || n.includes("scanner")) return <Printer size={16} />;
    if (n.includes("office") || n.includes("supplies")) return <Package size={16} />;
    if (n.includes("air") || n.includes("conditioning") || n.includes("ac")) return <Wind size={16} />;
    if (n.includes("dishwasher") || n.includes("utensils")) return <Utensils size={16} />;
    if (n.includes("coffee")) return <Coffee size={16} />;
    if (n.includes("iron")) return <Shirt size={16} />;
    if (n.includes("gym") || n.includes("fitness")) return <Dumbbell size={16} />;
    if (n.includes("concierge")) return <UserCheck size={16} />;
    if (n.includes("rooftop") || n.includes("sun")) return <Sun size={16} />;
    return <CheckCircle size={16} />;
};

const AmenitiesSection = ({ property, isAmenitiesOpen, setIsAmenitiesOpen, variant = "property" }) => {
    if (!property?.amenities) return null;

    // Filter amenities by variant — property shows building-level, unit shows unit-level
    const BUILDING_CATEGORIES = ['building', 'services', 'security'];
    const UNIT_CATEGORIES = ['connectivity', 'appliances', 'furniture'];

    const filteredAmenities = variant === "property"
        ? Object.entries(property.amenities)
            .filter(([cat]) => BUILDING_CATEGORIES.includes(cat))
            .reduce((acc, [cat, items]) => ({ ...acc, [cat]: items }), {})
        : variant === "unit"
        ? Object.entries(property.amenities)
            .filter(([cat]) => UNIT_CATEGORIES.includes(cat))
            .reduce((acc, [cat, items]) => ({ ...acc, [cat]: items }), {})
        : property.amenities;

    // If filtered result is empty, show all (fallback for unrecognized categories)
    const amenitiesData = Object.keys(filteredAmenities).length > 0 ? filteredAmenities : property.amenities;
    const allAmenities = Object.values(amenitiesData).flat();

    // Categorization Logic based on the reference image
    const billsIncludedKeywords = ["wifi", "internet", "fiber", "gas", "heating", "water", "electric", "power", "utilities"];
    const safetyKeywords = ["secure", "lock", "cctv", "fire", "alarm", "security", "assistance", "support", "guard"];

    const billsIncluded = allAmenities.filter(item =>
        billsIncludedKeywords.some(key => item.toLowerCase().includes(key))
    );

    const safetyAndSecurity = allAmenities.filter(item =>
        safetyKeywords.some(key => item.toLowerCase().includes(key)) && !billsIncluded.includes(item)
    );

    const commonAmenities = allAmenities.filter(item =>
        !billsIncluded.includes(item) && !safetyAndSecurity.includes(item)
    );

    // Mock utility estimates for display as seen in the reference image
    const getUtilityCostLabel = (name) => {
        const n = name.toLowerCase();
        if (n.includes("wifi") || n.includes("internet")) return "€15/week";
        if (n.includes("electric")) return "€12/week";
        if (n.includes("gas")) return "€10/week";
        if (n.includes("heating")) return "€8/week";
        if (n.includes("water")) return "€5/week";
        return "Est. N/A*";
    };

    return (
        <>
            <div id="amenities" className="pt-10 border-t border-[#0f4c3a]/10 scroll-mt-40">
                <h3 className="font-serif text-2xl text-[#111827] mb-8">
                    {variant === "unit" ? "Unit Amenities" : "Building & Common Spaces"}
                </h3>

                <div className="space-y-12">
                    {/* 1. BILLS INCLUDED */}
                    {billsIncluded.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-6 px-1">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#186b53]">Bills Included</h4>
                            <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-widest">(in rent)</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {billsIncluded.slice(0, 12).map((item, i) => (
                                <span key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#e5e7eb] bg-white text-sm font-medium text-[#111827]">
                                    <span className="text-[#9ca3af]">{React.cloneElement(getAmenityIcon(item), { size: 14 })}</span>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    )}

                    {/* 2. COMMON AMENITIES */}
                    {commonAmenities.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#186b53] mb-6 px-1">Common Amenities</h4>
                        <div className="flex flex-wrap gap-2.5">
                            {commonAmenities.slice(0, 12).map((item, i) => (
                                <span key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#e5e7eb] bg-white text-sm font-medium text-[#111827]">
                                    <span className="text-[#9ca3af]">{React.cloneElement(getAmenityIcon(item), { size: 14 })}</span>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    )}

                    {/* 3. SAFETY & SECURITY */}
                    {safetyAndSecurity.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#186b53] mb-6 px-1">Safety and Security</h4>
                        <div className="flex flex-wrap gap-2.5">
                            {safetyAndSecurity.slice(0, 12).map((item, i) => (
                                <span key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#e5e7eb] bg-white text-sm font-medium text-[#111827]">
                                    <span className="text-[#9ca3af]">{React.cloneElement(getAmenityIcon(item), { size: 14 })}</span>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    )}
                </div>

                <div className="mt-10 flex justify-start">
                    <button
                        onClick={() => setIsAmenitiesOpen(true)}
                        className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#111827] hover:opacity-60 transition-all px-1"
                    >
                        <span>View all {allAmenities.length} amenities</span>
                        <ArrowUpFromLine size={12} className="rotate-90 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* AMENITIES MODAL */}
            <AnimatePresence>
                {isAmenitiesOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAmenitiesOpen(false)}
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#f2f2f2] w-full max-w-2xl max-h-[80vh] rounded-[2rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col border border-white/20"
                        >
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-[#0f4c3a]/5 flex items-center justify-between bg-white/60 backdrop-blur-xl sticky top-0 z-10">
                                <div>
                                    <h3 className="font-serif text-xl text-[#111827] tracking-tight">Amenities</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-5 h-[1px] bg-[#186b53]"></span>
                                        <p className="text-xs text-[#186b53] font-bold uppercase tracking-[0.2em]">Full Residence Inventory</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAmenitiesOpen(false)}
                                    className="p-2 bg-white hover:bg-[#0f4c3a] hover:text-white rounded-full transition-all duration-300 shadow-sm border border-[#0f4c3a]/5 group"
                                >
                                    <X size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            {/* List */}
                            <div className="px-6 py-6 overflow-y-auto flex-1 arrivio-scrollbar">
                                <div className="space-y-6">
                                    {Object.entries(property.amenities).map(([category, items]) => (
                                        <div key={category}>
                                            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[#186b53] mb-3 pb-1.5 border-b border-[#0f4c3a]/5">
                                                {category}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((item, i) => (
                                                    <span key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#e5e7eb] bg-white text-sm font-medium text-[#111827]">
                                                        <span className="text-[#9ca3af]">{React.cloneElement(getAmenityIcon(item), { size: 14 })}</span>
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AmenitiesSection;
