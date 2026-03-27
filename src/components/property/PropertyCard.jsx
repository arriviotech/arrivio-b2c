

import React, { useState, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Heart,
    ChevronLeft,
    ChevronRight,
    Star,
    Ruler,
    DoorOpen,
    Sofa
} from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";

const PropertyCard = ({ property, activeTab, onClick, onMouseEnter, onMouseLeave, children, compact }) => {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isSaved = isInWishlist(property.id);
    const [copied, setCopied] = useState(false);

    // CAROUSEL STATE
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollRef = useRef(null);

    // Combine cover image and gallery
    const images = [property.image, ...(property.gallery || [])].filter(Boolean);

    const handleShare = useCallback(async (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}/property/${property.id}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: property.title || 'Property', url });
            } catch (err) { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [property.id, property.title]);

    const nextImage = (e) => {
        e?.stopPropagation();
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth, behavior: 'smooth' });
        }
    };

    const prevImage = (e) => {
        e?.stopPropagation();
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -scrollRef.current.offsetWidth, behavior: 'smooth' });
        }
    };

    const handleScroll = (e) => {
        const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
        if (index !== currentImageIndex) setCurrentImageIndex(index);
    };

    // ======================
    // LOGIC: AVAILABILITY
    // ======================
    const getAvailabilityStatus = (property) => {
        // unit_availability stores BLOCKED dates (occupied, maintenance, held, blocked)
        // No rows = fully available. Check if any units are available.
        const availableUnits = property.availableUnits || 0;
        const totalUnits = property.unitCount || 0;

        if (totalUnits === 0) return { label: "Coming soon", color: "gray" };
        if (availableUnits === 0) return { label: "Fully booked", color: "red" };
        return { label: `${availableUnits} ${availableUnits === 1 ? 'unit' : 'units'} available`, color: "green" };
    };

    const { label: availLabel, color: availColor } = getAvailabilityStatus(property);

    // ======================
    // LOGIC: RATINGS (Stable)
    // ======================
    const { rating, reviews } = useMemo(() => {
        const stableRating = property.rating || (4.5 + Math.random() * 0.5).toFixed(1);
        const stableReviews = property.reviews_count || Math.floor(Math.random() * 20) + 5;
        return { rating: stableRating, reviews: stableReviews };
    }, [property.id, property.rating, property.reviews_count]);
    

    return (
        <div className={`relative ${compact ? 'pb-[8px] pr-[8px]' : 'pb-[12px] pr-[12px]'}`}>
          {/* Stack layer 2 — furthest back */}
          <div className={`absolute inset-0 bg-[#EAE6DF] rounded-[16px] border border-[#d9d5ce] shadow-sm ${compact ? 'mt-[8px] ml-[8px]' : 'mt-[12px] ml-[12px]'}`} />
          {/* Stack layer 1 — middle */}
          <div className={`absolute inset-0 bg-[#F0ECE6] rounded-[16px] border border-[#e0dcd6] shadow-sm ${compact ? 'mt-[4px] ml-[4px] mr-[4px] mb-[4px]' : 'mt-[6px] ml-[6px] mr-[6px] mb-[6px]'}`} />
        <motion.div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            whileHover={{ boxShadow: "0 8px 20px rgba(0,0,0,0.06)" }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer bg-white rounded-[16px] overflow-hidden border border-[#f2f2f2] hover:border-[#0f4c3a]/20 flex flex-col group/card relative h-full"
        >
            {/* 1. IMAGE CAROUSEL */}
            <div className={`relative bg-gray-100 group overflow-hidden ${compact ? '' : 'aspect-[5/4] sm:aspect-[3/2]'}`} style={compact ? { aspectRatio: '16/9' } : undefined}>
                {/* SCROLL CONTAINER */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
                >
                    {images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={property.title}
                            className="w-full h-full object-cover flex-shrink-0 snap-center group-hover/card:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    ))}
                </div>


                {/* OVERLAY: HEART (Wishlist) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(property);
                    }}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform group/heart"
                >
                    <Heart
                        size={18}
                        className={`transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-[#4b5563] group-hover/heart:text-red-500"}`}
                    />
                </button>

                {/* OVERLAY: ARROWS (Hover Only) */}
                {images.length > 1 && (
                    <>
                        {currentImageIndex > 0 && (
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md text-[#111827] opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        )}

                        {currentImageIndex < images.length - 1 && (
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md text-[#111827] opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                            >
                                <ChevronRight size={16} />
                            </button>
                        )}

                        {/* DOTS */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
                            {images.slice(0, 5).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 2. CARD BODY */}
            <div className={`${compact ? 'p-3.5' : 'p-4'} flex flex-col flex-grow`}>
                {/* TITLE + RATING ROW */}
                <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-serif text-xl sm:text-[17px] leading-[1.3] text-[#111827] line-clamp-2">
                        {property.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <Star size={14} className="fill-emerald-500 text-emerald-500" />
                        <span className="text-base sm:text-sm font-bold text-[#111827]">{rating}</span>
                        <span className="text-sm sm:text-xs text-[#4b5563]">({reviews})</span>
                    </div>
                </div>

                {/* SPECS ROW */}
                <div className="flex items-center gap-3 mb-3 text-base sm:text-xs text-[#374151]">
                    <span className="flex items-center gap-1">
                        <Ruler size={14} className="sm:w-3 sm:h-3" />
                        {property.details?.size || "-"} m²
                    </span>
                    <span className="flex items-center gap-1">
                        <DoorOpen size={14} className="sm:w-3 sm:h-3" />
                        {property.unitCount || 1} units
                    </span>
                    {property.furnishing === 'furnished' && (
                        <span className="flex items-center gap-1">
                            <Sofa size={14} className="sm:w-3 sm:h-3" />
                            Furnished
                        </span>
                    )}
                </div>

                {/* PRICE ROW */}
                <div className="mt-auto mb-3">
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm sm:text-[11px] text-[#9ca3af] font-medium">from </span>
                        <span className="font-sans text-2xl sm:text-[18px] font-bold text-[#111827]">
                            €{Number(property.price).toLocaleString()}
                        </span>
                        <span className="text-sm sm:text-[11px] text-[#6b7280] font-medium">
                            /month
                        </span>
                    </div>
                </div>

                {/* 3. FOOTER: AVAILABILITY (Divider + Status) */}
                <div className="border-t border-[#e5e7eb] pt-3 flex items-center gap-2">
                    {availColor === "green" ? (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
                    )}
                    <span className={`text-sm sm:text-[12px] font-bold ${availColor === "green" ? "text-[#16a34a]" : availColor === "red" ? "text-[#EA4335]" : "text-[#6b7280]"}`}>
                        {availLabel}
                    </span>
                </div>
            </div>
            {children}
        </motion.div>
        </div>
    );
};

export default PropertyCard;




