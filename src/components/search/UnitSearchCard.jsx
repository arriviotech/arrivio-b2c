import React, { useState, useRef } from "react";
import { Ruler, Layers, Users, Sofa, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";

const UNIT_TYPE_LABELS = {
  studio: "Studio",
  one_bedroom: "1 Bedroom",
  two_bedroom: "2 Bedroom",
  shared_room: "Shared Room",
};

const TIER_STYLES = {
  standard: { label: "Standard", classes: "bg-[#f2f2f2] text-[#111827] border-[#0f4c3a]/20 shadow-sm" },
  premium: { label: "Premium", classes: "bg-gradient-to-r from-[#B8860B] to-[#DAA520] text-white border-[#B8860B] shadow-sm" },
  executive: { label: "Executive", classes: "bg-[#0f4c3a] text-[#f2f2f2] border-[#0f4c3a] shadow-sm" },
};

const UnitSearchCard = ({ unit, property, onClick }) => {
  const { isUnitInWishlist, toggleUnitWishlist } = useWishlist();
  const tierStyle = TIER_STYLES[unit.tier] || TIER_STYLES.standard;
  const pricing = (unit.unit_pricing_rules || []).sort((a, b) => a.monthly_rent_cents - b.monthly_rent_cents)[0];
  const monthlyRent = pricing ? Math.round(pricing.monthly_rent_cents / 100) : 0;
  const wishlisted = isUnitInWishlist(unit.id);

  // Build image list — cover + gallery
  const coverImage = property.image || property.cover_image;
  const galleryImages = (property.gallery || []).map(g => g.url || g).filter(Boolean);
  const images = [coverImage, ...galleryImages].filter(Boolean);

  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef(null);

  const nextImage = (e) => {
    e?.stopPropagation();
    if (scrollRef.current) scrollRef.current.scrollBy({ left: scrollRef.current.offsetWidth, behavior: 'smooth' });
  };
  const prevImage = (e) => {
    e?.stopPropagation();
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -scrollRef.current.offsetWidth, behavior: 'smooth' });
  };
  const handleScroll = (e) => {
    const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
    if (index !== currentImageIndex) setCurrentImageIndex(index);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm overflow-hidden cursor-pointer group hover:shadow-md transition-all"
    >
      {/* Image Carousel */}
      <div className="relative aspect-[5/4] sm:aspect-[3/2] overflow-hidden bg-[#f2f2f2]">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          {images.length > 0 ? images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={property.title}
              className="w-full h-full object-cover flex-shrink-0 snap-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )) : (
            <div className="w-full h-full bg-[#0f4c3a]/5 flex-shrink-0" />
          )}
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md text-[#111827] opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105">
                <ChevronLeft size={16} />
              </button>
            )}
            {currentImageIndex < images.length - 1 && (
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md text-[#111827] opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105">
                <ChevronRight size={16} />
              </button>
            )}
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
              {images.slice(0, 5).map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          </>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleUnitWishlist(unit, property.id); }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/95 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform group/heart"
        >
          <Heart size={16} className={`transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-[#4b5563] group-hover/heart:text-red-500"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Unit type + tier */}
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-serif text-xl sm:text-[17px] leading-[1.3] text-[#111827] group-hover:text-[#1f2937] transition-colors" style={{ fontVariantNumeric: 'lining-nums' }}>
            {UNIT_TYPE_LABELS[unit.unit_type] || unit.unit_type}
          </h3>
          <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[8px] font-bold uppercase tracking-wider ${
            unit.tier === 'executive' ? 'bg-[#0f4c3a] text-[#f2f2f2]' :
            unit.tier === 'premium' ? 'bg-gradient-to-r from-[#B8860B] to-[#DAA520] text-white' :
            'bg-[#f2f2f2] text-[#111827]'
          }`}>
            {tierStyle.label}
          </span>
        </div>
        <p className="text-base sm:text-[12px] text-[#4b5563] font-medium mb-3">
          {property.title} · {property.location || property.city}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-3 text-base sm:text-xs text-[#374151]">
          <span className="flex items-center gap-1">
            <Ruler size={14} className="sm:w-3 sm:h-3" />
            {unit.size_sqm} m²
          </span>
          <span className="flex items-center gap-1">
            <Layers size={14} className="sm:w-3 sm:h-3" />
            {unit.floor === 0 ? "Ground" : `Floor ${unit.floor}`}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} className="sm:w-3 sm:h-3" />
            {unit.max_occupants}
          </span>
          {unit.is_furnished && (
            <span className="flex items-center gap-1">
              <Sofa size={14} className="sm:w-3 sm:h-3" />
              Furnished
            </span>
          )}
        </div>

        {/* Price + Availability */}
        <div className="flex items-center justify-between pt-2 border-t border-[#0f4c3a]/5">
          <div className="flex items-baseline gap-1">
            <span className="font-sans text-2xl sm:text-[18px] font-bold text-[#111827]">€{monthlyRent.toLocaleString()}</span>
            <span className="text-sm sm:text-[11px] text-[#6b7280]">/month</span>
          </div>
          <span className="flex items-center gap-1.5 text-sm sm:text-[10px] font-bold text-[#16a34a]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
            </span>
            Available
          </span>
        </div>
      </div>
    </div>
  );
};

export default UnitSearchCard;
