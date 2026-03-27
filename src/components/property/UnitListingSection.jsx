import React, { useState } from "react";
import { BedDouble, Ruler, Layers, Users, Sofa, ChevronDown } from "lucide-react";

const UNIT_TYPE_LABELS = {
  studio: "Studio",
  one_bedroom: "1 Bedroom",
  two_bedroom: "2 Bedroom",
  shared_room: "Shared Room",
};

const TIER_STYLES = {
  standard: { label: "Standard", classes: "bg-[#f2f2f2] text-[#111827] border border-[#0f4c3a]/20" },
  premium: { label: "Premium", classes: "bg-gradient-to-r from-[#B8860B] to-[#DAA520] text-white border border-[#B8860B]" },
  executive: { label: "Executive", classes: "bg-[#0f4c3a] text-[#f2f2f2] border border-[#0f4c3a]" },
};

const TENANT_TYPE_LABELS = {
  professional: "Professional",
  student: "Student",
  azubi: "Azubi",
  b2b: "B2B",
};

const getFloorLabel = (floor) => {
  if (floor === 0) return 'Ground Floor';
  const s = floor === 1 ? 'st' : floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th';
  return `${floor}${s} Floor`;
};

const getUnitDisplayName = (unit) => {
  return UNIT_TYPE_LABELS[unit.unit_type] || unit.unit_type;
};

const UnitCard = ({ unit, unitImage, onSelect }) => {
  const tierStyle = TIER_STYLES[unit.tier] || TIER_STYLES.standard;
  const pricingRules = (unit.unit_pricing_rules || []).sort((a, b) => a.monthly_rent_cents - b.monthly_rent_cents);
  const cheapest = pricingRules[0];
  const cheapestRent = cheapest ? Math.round(cheapest.monthly_rent_cents / 100) : 0;
  const isAvailable = unit.status === "available";
  const displayName = getUnitDisplayName(unit);

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer group ${
      isAvailable ? "border-[#0f4c3a]/10" : "border-[#0f4c3a]/5 opacity-60"
    }`} onClick={() => isAvailable && onSelect(unit)}>

      {/* ── MOBILE: vertical card ── */}
      <div className="md:hidden">
        {/* Image */}
        {unitImage && (
          <div className="relative w-full aspect-[16/9] overflow-hidden">
            <img src={unitImage} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            {/* Tier badge on image */}
            <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${tierStyle.classes}`}>
              {tierStyle.label}
            </span>
            {/* Price on image */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm flex items-baseline gap-0.5">
              <span className="text-base font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{cheapestRent.toLocaleString()}</span>
              <span className="text-[10px] text-[#6b7280]">/mo</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="px-4 py-3 space-y-2.5">
          {/* Name */}
          <h3 className="font-serif text-lg text-[#111827] leading-tight" style={{ fontVariantNumeric: 'lining-nums' }}>
            {displayName}
          </h3>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-[13px] text-[#4b5563]">
            <span className="flex items-center gap-1"><Ruler size={13} className="text-[#9ca3af]" />{unit.size_sqm} m²</span>
            <span className="flex items-center gap-1"><Layers size={13} className="text-[#9ca3af]" />{getFloorLabel(unit.floor)}</span>
            <span className="flex items-center gap-1"><Users size={13} className="text-[#9ca3af]" />{unit.max_occupants}</span>
          </div>

          {/* Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {unit.is_furnished && (
              <span className="flex items-center gap-1 px-2 py-1 bg-[#0f4c3a]/10 rounded-md text-xs font-medium text-[#0f4c3a]">
                <Sofa size={11} /> Furnished
              </span>
            )}
            <span className="px-2 py-1 bg-[#f0f0f0] rounded-md text-xs font-medium text-[#6b7280]">
              Bills included
            </span>
            {cheapest?.min_stay_months && (
              <span className="px-2 py-1 bg-[#f0f0f0] rounded-md text-xs font-medium text-[#6b7280]">
                Min {cheapest.min_stay_months}mo
              </span>
            )}
          </div>

          {/* Bottom: Availability + CTA */}
          <div className="flex items-center justify-between pt-1">
            <span className={`flex items-center gap-1.5 text-xs font-bold ${isAvailable ? 'text-[#16a34a]' : 'text-[#EA4335]'}`}>
              {isAvailable ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
              )}
              {isAvailable ? 'Available now' : 'Occupied'}
            </span>
            {isAvailable && (
              <span className="text-[11px] font-bold text-[#0f4c3a] uppercase tracking-wider">
                View details →
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP: horizontal card (original) ── */}
      <div className="hidden md:flex min-h-[150px]">
        {/* Left — Image */}
        {unitImage && (
          <div className="relative w-[200px] shrink-0 overflow-hidden">
            <img src={unitImage} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        )}

        {/* Right — Info */}
        <div className="flex-1 px-5 py-4 flex flex-col justify-between min-w-0">
          {/* Row 1: Name + Tier + Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <h3 className="font-serif text-xl text-[#111827] truncate leading-tight" style={{ fontVariantNumeric: 'lining-nums' }}>
                {displayName}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${tierStyle.classes}`}>
                {tierStyle.label}
              </span>
            </div>
            <div className="text-right shrink-0 ml-3 flex items-baseline gap-1">
              <span className="text-lg font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{cheapestRent.toLocaleString()}</span>
              <span className="text-xs text-[#6b7280]">/month</span>
            </div>
          </div>

          {/* Row 2: Stats */}
          <div className="flex items-center gap-5 text-sm text-[#4b5563]">
            <span className="flex items-center gap-1.5"><Ruler size={15} className="text-[#9ca3af]" />{unit.size_sqm} m²</span>
            <span className="flex items-center gap-1.5"><Layers size={15} className="text-[#9ca3af]" />{getFloorLabel(unit.floor)}</span>
            <span className="flex items-center gap-1.5"><Users size={15} className="text-[#9ca3af]" />Max {unit.max_occupants}</span>
          </div>

          {/* Row 3: Pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {unit.is_furnished && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-[#0f4c3a]/10 rounded-lg text-[11px] font-medium text-[#0f4c3a]">
                <Sofa size={12} /> Furnished
              </span>
            )}
            {cheapest?.min_stay_months && (
              <span className="px-2.5 py-1 bg-[#f0f0f0] rounded-lg text-[11px] font-medium text-[#6b7280]">
                Min {cheapest.min_stay_months} months
              </span>
            )}
            <span className="px-2.5 py-1 bg-[#f0f0f0] rounded-lg text-[11px] font-medium text-[#6b7280]">
              {unit.size_sqm > 30 ? 'Private bathroom' : 'Shared bathroom'}
            </span>
            <span className="px-2.5 py-1 bg-[#0f4c3a]/5 rounded-lg text-[11px] font-medium text-[#6b7280]">
              Bills included
            </span>
          </div>

          {/* Row 4: Availability + CTA */}
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1.5 text-sm font-bold ${isAvailable ? 'text-[#16a34a]' : 'text-[#EA4335]'}`}>
              {isAvailable ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
              )}
              {isAvailable ? 'Available now' : 'Occupied'}
            </span>
            {isAvailable && (
              <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest group-hover:text-[#111827] transition-colors">
                View details →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UnitListingSection = ({ property, onSelectUnit }) => {
  const units = property?.units || [];
  const photos = property?.property_photos || [];
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  // Build a map of unit_id → first photo URL
  const unitImageMap = {};
  photos.forEach((p) => {
    if (p.unit_id && !unitImageMap[p.unit_id]) {
      unitImageMap[p.unit_id] = p.storage_path;
    }
  });
  // Fallback: property cover image
  const propertyCover = photos.find((p) => p.is_primary)?.storage_path || photos[0]?.storage_path;

  if (units.length === 0) return null;

  const unitTypes = [...new Set(units.map((u) => u.unit_type))];

  const filteredUnits = units
    .filter((u) => filter === "all" || u.unit_type === filter)
    .sort((a, b) => {
      // Available first, then by price
      if (a.status === "available" && b.status !== "available") return -1;
      if (a.status !== "available" && b.status === "available") return 1;
      const priceA = (a.unit_pricing_rules?.[0]?.monthly_rent_cents) || 0;
      const priceB = (b.unit_pricing_rules?.[0]?.monthly_rent_cents) || 0;
      return priceA - priceB;
    });

  const visibleUnits = showAll ? filteredUnits : filteredUnits.slice(0, 4);
  const availableCount = units.filter((u) => u.status === "available").length;

  return (
    <div id="units" className="pt-10 border-t border-[#0f4c3a]/10 scroll-mt-40">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif text-[#111827] mb-1">Available Units</h2>
          <p className="text-xs text-[#6b7280]">
            {availableCount} of {units.length} units available
          </p>
        </div>
      </div>

      {/* Type Filter */}
      {unitTypes.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              filter === "all"
                ? "bg-[#0f4c3a] text-[#f2f2f2]"
                : "bg-white border border-[#0f4c3a]/10 text-[#4b5563] hover:border-[#0f4c3a]/30"
            }`}
          >
            All ({units.length})
          </button>
          {unitTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                filter === type
                  ? "bg-[#0f4c3a] text-[#f2f2f2]"
                  : "bg-white border border-[#0f4c3a]/10 text-[#4b5563] hover:border-[#0f4c3a]/30"
              }`}
            >
              {UNIT_TYPE_LABELS[type] || type} ({units.filter((u) => u.unit_type === type).length})
            </button>
          ))}
        </div>
      )}

      {/* Unit Cards Grid */}
      <div className="grid grid-cols-1 gap-3">
        {visibleUnits.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            unitImage={unitImageMap[unit.id] || propertyCover}
            onSelect={onSelectUnit}
          />
        ))}
      </div>

      {/* Show More */}
      {filteredUnits.length > 4 && !showAll && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#0f4c3a]/10 text-[#4b5563] rounded-full text-xs font-bold uppercase tracking-widest hover:border-[#0f4c3a]/30 transition-colors"
          >
            <ChevronDown size={14} />
            Show all {filteredUnits.length} units
          </button>
        </div>
      )}
    </div>
  );
};

export default UnitListingSection;
