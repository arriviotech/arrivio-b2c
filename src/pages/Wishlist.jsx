import React, { useState, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Scale, Trash2, ArrowUpDown,
  Ruler, Layers, Users, Sofa, DoorOpen, Star, MapPin,
  Crown, Trophy, Check, X, Square, CheckSquare, Undo2
} from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import WishlistSkeleton from "../components/skeletons/WishlistSkeleton";

const SORT_OPTIONS = [
  { key: "recent", label: "Recently Added" },
  { key: "price-asc", label: "Price: Low → High" },
  { key: "price-desc", label: "Price: High → Low" },
  { key: "city", label: "City A–Z" },
];

const TIER_STYLES = {
  standard: "bg-[#f2f2f2] text-[#111827]",
  premium: "bg-gradient-to-r from-[#B8860B] to-[#DAA520] text-white",
  executive: "bg-[#0f4c3a] text-white",
};

const Wishlist = () => {
  const {
    propertyWishlist, unitWishlist, loading, totalSaved,
    addToWishlist, addUnitToWishlist,
    removeFromWishlist, removeUnitFromWishlist
  } = useWishlist();
  const navigate = useNavigate();

  const [tab, setTab] = useState("properties");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [sort, setSort] = useState("recent");
  const [showSort, setShowSort] = useState(false);
  const [propPage, setPropPage] = useState(1);
  const [unitPage, setUnitPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [undoState, setUndoState] = useState(null);
  const undoTimerRef = useRef(null);

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleDeleteSelected = () => {
    const idsToDelete = [...selectedIds];
    const isProps = tab === "properties";
    // Snapshot for undo
    const snapshot = isProps
      ? propertyWishlist.filter(p => idsToDelete.includes(p.id))
      : unitWishlist.filter(u => idsToDelete.includes(u.id));

    // Instantly remove from UI
    if (isProps) {
      idsToDelete.forEach(id => removeFromWishlist(id));
    } else {
      idsToDelete.forEach(id => removeUnitFromWishlist(id));
    }
    setSelectedIds([]);

    // Show undo toast
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoState({ items: snapshot, type: isProps ? "properties" : "units", count: idsToDelete.length });

    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
    }, 5000);
  };

  const handleUndo = useCallback(() => {
    if (!undoState) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    // Re-add items
    if (undoState.type === "properties") {
      undoState.items.forEach(p => addToWishlist(p));
    } else {
      undoState.items.forEach(u => addUnitToWishlist(u, u.property?.id || u.properties?.id));
    }
    setUndoState(null);
  }, [undoState, addToWishlist, addUnitToWishlist]);

  const sortItems = (items) => [...items].sort((a, b) => {
    if (sort === "price-asc") return (a.price || 0) - (b.price || 0);
    if (sort === "price-desc") return (b.price || 0) - (a.price || 0);
    if (sort === "city") {
      const cityA = (tab === "units" ? a.property?.city : a.city) || "";
      const cityB = (tab === "units" ? b.property?.city : b.city) || "";
      return cityA.localeCompare(cityB);
    }
    return 0;
  });

  const sortedProperties = sortItems(propertyWishlist);
  const sortedUnits = sortItems(unitWishlist);
  const propTotalPages = Math.ceil(sortedProperties.length / ITEMS_PER_PAGE);
  const unitTotalPages = Math.ceil(sortedUnits.length / ITEMS_PER_PAGE);
  const visibleProperties = sortedProperties.slice((propPage - 1) * ITEMS_PER_PAGE, propPage * ITEMS_PER_PAGE);
  const visibleUnits = sortedUnits.slice((unitPage - 1) * ITEMS_PER_PAGE, unitPage * ITEMS_PER_PAGE);
  const selectedProperties = propertyWishlist.filter(p => selectedIds.includes(p.id));
  const selectedUnits = unitWishlist.filter(u => selectedIds.includes(u.id));
  const currentList = tab === "properties" ? propertyWishlist : unitWishlist;
  const canSelect = currentList.length >= 2;

  if (loading) return <WishlistSkeleton />;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 pt-2">
          <div>
            <h2 className="text-2xl font-serif text-[#111827] mb-0.5">My Shortlist</h2>
            <p className="text-sm text-[#6b7280]">
              {totalSaved === 0 ? "Save properties and units you like." : `${totalSaved} ${totalSaved === 1 ? 'item' : 'items'} saved`}
            </p>
          </div>
          {totalSaved > 0 && (
            <div className="relative">
              <button onClick={() => setShowSort(!showSort)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e5e7eb] rounded-full text-[10px] font-bold uppercase tracking-widest text-[#374151] hover:border-[#0f4c3a]/30 transition-colors">
                <ArrowUpDown size={12} />
                {SORT_OPTIONS.find(s => s.key === sort)?.label}
              </button>
              {showSort && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden min-w-[180px]">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => { setSort(opt.key); setShowSort(false); setPropPage(1); setUnitPage(1); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${sort === opt.key ? "bg-[#0f4c3a]/5 text-[#0f4c3a] font-bold" : "text-[#374151] hover:bg-[#f7f7f7]"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {/* Tabs */}
        {totalSaved > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => { setTab("properties"); setSelectedIds([]); setPropPage(1); }}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${tab === "properties" ? "bg-[#0f4c3a] text-white" : "bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a]/30"}`}>
              Properties ({propertyWishlist.length})
            </button>
            <button onClick={() => { setTab("units"); setSelectedIds([]); setUnitPage(1); }}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${tab === "units" ? "bg-[#0f4c3a] text-white" : "bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a]/30"}`}>
              Units ({unitWishlist.length})
            </button>
          </div>
        )}

        {/* Selection bar — appears when any item is selected */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 md:px-4 py-2.5 bg-[#0f4c3a]/[0.04] border border-[#0f4c3a]/10 rounded-xl">
              <p className="text-[11px] text-[#374151]">
                <span className="font-bold">{selectedIds.length}</span> of {currentList.length} selected
              </p>
              <div className="flex items-center gap-2 md:gap-3">
                {selectedIds.length < currentList.length && (
                  <button onClick={() => setSelectedIds(currentList.map(i => i.id))}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#0f4c3a] hover:underline">
                    Select All
                  </button>
                )}
                <button onClick={() => setSelectedIds([])}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] hover:text-[#374151] transition-colors">
                  Clear
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="p-1.5 rounded-full text-[#9ca3af] hover:text-[#EA4335] hover:bg-[#EA4335]/5 transition-colors"
                  title={`Delete ${selectedIds.length} selected`}>
                  <Trash2 size={15} />
                </button>
                {selectedIds.length >= 2 && selectedIds.length <= 3 && (
                  <button
                    onClick={() => setIsCompareOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#0f4c3a] text-white hover:bg-[#0a3a2b] transition-all">
                    <Scale size={11} />
                    Compare
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty */}
        {totalSaved === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-2xl border border-[#e5e7eb]">
            <div className="w-16 h-16 bg-[#f2f2f2] rounded-full flex items-center justify-center mb-5">
              <Heart size={28} className="text-[#D4A017]" />
            </div>
            <h2 className="text-xl font-serif text-[#111827] mb-2">No saved properties</h2>
            <p className="text-sm text-[#6b7280] mb-6 max-w-sm">Start exploring and save your favorite stays.</p>
            <Link to="/search" className="px-6 py-2.5 rounded-full bg-[#0f4c3a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-all">Explore Stays</Link>
          </div>
        )}

        {/* ═══ PROPERTIES TAB ═══ */}
        {tab === "properties" && propertyWishlist.length > 0 && (
          <>
            <div className="space-y-3">
              {visibleProperties.map((property, i) => (
                <PropertyRow
                  key={property.id}
                  property={property}
                  index={i}
                  isSelected={selectedIds.includes(property.id)}
                  onSelect={() => toggleSelection(property.id)}
                  onRemove={() => removeFromWishlist(property.id)}
                  onClick={() => navigate(`/property/${property.slug || property.id}`)}
                  showSelect={propertyWishlist.length >= 2}
                />
              ))}
            </div>
            {propTotalPages > 1 && (
              <Pagination current={propPage} total={propTotalPages} count={sortedProperties.length} perPage={ITEMS_PER_PAGE} onChange={setPropPage} />
            )}
          </>
        )}
        {tab === "properties" && propertyWishlist.length === 0 && totalSaved > 0 && (
          <EmptyTabState icon={Heart} title="No saved properties" desc="Browse our listings and tap the heart to save properties." />
        )}

        {/* ═══ UNITS TAB ═══ */}
        {tab === "units" && unitWishlist.length > 0 && (
          <>
            <div className="space-y-3">
              {visibleUnits.map((unit, i) => (
                <UnitRow
                  key={unit.id}
                  unit={unit}
                  index={i}
                  isSelected={selectedIds.includes(unit.id)}
                  onSelect={() => toggleSelection(unit.id)}
                  onRemove={() => removeUnitFromWishlist(unit.id)}
                  onClick={() => navigate(`/unit/${unit.slug || unit.id}`)}
                  showSelect={unitWishlist.length >= 2}
                />
              ))}
            </div>
            {unitTotalPages > 1 && (
              <Pagination current={unitPage} total={unitTotalPages} count={sortedUnits.length} perPage={ITEMS_PER_PAGE} onChange={setUnitPage} />
            )}
          </>
        )}
        {tab === "units" && unitWishlist.length === 0 && totalSaved > 0 && (
          <EmptyTabState icon={DoorOpen} title="No saved units" desc="Browse individual units and save the ones you like." />
        )}
      </div>

      {/* Undo Toast */}
      <AnimatePresence>
        {undoState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[100] bg-[#111827] text-white pl-4 pr-3 py-3 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <p className="text-sm">
              {undoState.count} {undoState.count === 1 ? "item" : "items"} removed
            </p>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold uppercase tracking-widest text-white transition-colors"
            >
              <Undo2 size={12} />
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare View */}
      <AnimatePresence>
        {isCompareOpen && (
          <CompareView properties={selectedProperties} onClose={() => setIsCompareOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

// ═══════════════════════════════════════
// Property Row — compact horizontal card
// ═══════════════════════════════════════
const PropertyRow = ({ property, index, isSelected, onSelect, onRemove, onClick, showSelect }) => {
  const images = [property.image, ...(property.gallery?.map(g => g.url || g) || [])].filter(Boolean);
  const availableUnits = property.availableUnits || 0;
  const unitCount = property.unitCount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-white rounded-xl border overflow-hidden group flex hover:shadow-md transition-all ${isSelected ? "border-[#0f4c3a] ring-1 ring-[#0f4c3a]/20" : "border-[#e5e7eb]"}`}
    >
      {/* Image */}
      <div onClick={onClick} className="relative w-28 sm:w-36 md:w-44 shrink-0 overflow-hidden bg-[#f2f2f2] cursor-pointer">
        {images[0] && <img src={images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
        <div className="absolute bottom-2 left-2 z-10">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-sm ${availableUnits > 0 ? "bg-white/90 text-[#16a34a]" : "bg-white/90 text-[#EA4335]"}`}>
            {availableUnits > 0 ? (
              <><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22C55E]" /></span>{availableUnits} free</>
            ) : "Booked"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div onClick={onClick} className="flex-1 p-3.5 flex flex-col justify-between min-w-0 cursor-pointer">
        <div>
          <h3 className="font-serif text-[15px] leading-snug text-[#111827] truncate pr-2 mb-1">{property.title}</h3>
          <p className="text-[11px] text-[#6b7280] mb-2 flex items-center gap-1"><MapPin size={10} /> {property.location || property.city}</p>
          <div className="flex flex-wrap gap-1.5">
            {property.details?.size && <MiniPill><Ruler size={10} /> {property.details.size} m²</MiniPill>}
            <MiniPill><DoorOpen size={10} /> {unitCount} units</MiniPill>
            {property.furnishing === "furnished" && <MiniPill><Sofa size={10} /> Furnished</MiniPill>}
          </div>
        </div>
        <div className="flex items-baseline gap-0.5 mt-2">
          <span className="text-[10px] text-[#9ca3af]">from</span>
          <span className="text-base font-bold text-[#111827]" style={{ fontVariantNumeric: "lining-nums" }}>€{Number(property.price).toLocaleString()}</span>
          <span className="text-[10px] text-[#6b7280]">/mo</span>
        </div>
      </div>

      {/* Actions column — select top, delete bottom, vertically aligned */}
      <div className="shrink-0 w-10 flex flex-col items-center justify-between py-3">
        {showSelect ? (
          <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="transition-transform hover:scale-110">
            {isSelected
              ? <CheckSquare size={15} className="text-[#0f4c3a]" />
              : <Square size={15} className="text-[#9ca3af] hover:text-[#6b7280] transition-colors" />}
          </button>
        ) : <div />}
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-[#9ca3af] hover:text-[#EA4335] transition-colors" title="Remove">
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════
// Unit Row — compact horizontal card
// ═══════════════════════════════════════
const UnitRow = ({ unit, index, isSelected, onSelect, onRemove, onClick, showSelect }) => {
  const coverImage = unit.coverImage || unit.gallery?.[0];
  const tierStyle = TIER_STYLES[unit.tier] || TIER_STYLES.standard;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-white rounded-xl border overflow-hidden group flex hover:shadow-md transition-all ${isSelected ? "border-[#0f4c3a] ring-1 ring-[#0f4c3a]/20" : "border-[#e5e7eb]"}`}
    >
      {/* Image */}
      <div onClick={onClick} className="relative w-28 sm:w-36 md:w-44 shrink-0 overflow-hidden bg-[#f2f2f2] cursor-pointer">
        {coverImage && <img src={coverImage} alt={unit.unitTypeLabel} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
        <span className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-sm ${tierStyle}`}>
          {unit.tierLabel}
        </span>
        <div className="absolute bottom-2 left-2 z-10">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-sm ${unit.status === "available" ? "bg-white/90 text-[#16a34a]" : "bg-white/90 text-[#EA4335]"}`}>
            {unit.status === "available" ? (
              <><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22C55E]" /></span>Available</>
            ) : "Occupied"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div onClick={onClick} className="flex-1 p-3.5 flex flex-col justify-between min-w-0 cursor-pointer">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-serif text-[15px] leading-snug text-[#111827] pr-2" style={{ fontVariantNumeric: "lining-nums" }}>{unit.unitTypeLabel}</h3>
            {unit.unit_number && (
              <span className="text-[9px] font-bold text-[#9ca3af] bg-[#f2f2f2] px-1.5 py-0.5 rounded">#{unit.unit_number}</span>
            )}
          </div>
          <p className="text-[11px] text-[#6b7280] mb-2 flex items-center gap-1">
            <MapPin size={10} /> {unit.property?.name} · {unit.property?.location || unit.property?.city}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <MiniPill><Ruler size={10} /> {unit.size_sqm} m²</MiniPill>
            <MiniPill><Layers size={10} /> {unit.floor === 0 ? "Ground" : `F${unit.floor}`}</MiniPill>
            <MiniPill><Users size={10} /> {unit.max_occupants}</MiniPill>
            {unit.is_furnished && <MiniPill><Sofa size={10} /> Furnished</MiniPill>}
          </div>
        </div>
        <div className="flex items-baseline gap-0.5 mt-2">
          <span className="text-base font-bold text-[#111827]" style={{ fontVariantNumeric: "lining-nums" }}>€{(unit.price || 0).toLocaleString()}</span>
          <span className="text-[10px] text-[#6b7280]">/mo</span>
        </div>
      </div>

      {/* Actions column — select top, delete bottom */}
      <div className="shrink-0 w-10 flex flex-col items-center justify-between py-3">
        {showSelect ? (
          <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="transition-transform hover:scale-110">
            {isSelected
              ? <CheckSquare size={15} className="text-[#0f4c3a]" />
              : <Square size={15} className="text-[#9ca3af] hover:text-[#6b7280] transition-colors" />}
          </button>
        ) : <div />}
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-[#9ca3af] hover:text-[#EA4335] transition-colors" title="Remove">
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════
// Mini Pill — tiny stat badge
// ═══════════════════════════════════════
const MiniPill = ({ children, hideOnMobile }) => (
  <span className={`inline-flex items-center gap-1 bg-[#f7f7f7] rounded-md px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-medium text-[#374151] ${hideOnMobile ? 'hidden sm:inline-flex' : ''}`}>
    {children}
  </span>
);

// ═══════════════════════════════════════
// Compare View — redesigned side-by-side
// ═══════════════════════════════════════
const CompareView = ({ properties, onClose }) => {
  if (!properties || properties.length < 2) return null;

  const parseArea = (p) => {
    const val = p?.details?.size;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return Math.max(...val.split(/[–-]/).map(s => parseInt(s, 10)).filter(Boolean));
    return 0;
  };

  const getAmenityList = (p) => {
    if (!p?.amenities || typeof p.amenities !== 'object') return [];
    if (Array.isArray(p.amenities)) return p.amenities;
    return Object.values(p.amenities).flat();
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const items = properties.map(p => ({
      id: p.id,
      title: p.title,
      image: p.image,
      city: p.city,
      location: p.location,
      price: Number(p.price) || 0,
      area: parseArea(p),
      units: p.unitCount || 0,
      available: p.availableUnits || 0,
      amenities: getAmenityList(p),
      furnished: p.furnishing === 'furnished',
    }));

    const maxPrice = Math.max(...items.map(i => i.price));
    const minPrice = Math.min(...items.filter(i => i.price > 0).map(i => i.price));
    const maxArea = Math.max(...items.map(i => i.area));
    const maxUnits = Math.max(...items.map(i => i.units));

    // Score each property
    items.forEach(item => {
      let score = 0;
      const wins = [];
      if (item.price === minPrice && item.price > 0) { score += 25; wins.push("Best Price"); }
      if (item.area === maxArea && item.area > 0) { score += 30; wins.push("Largest"); }
      if (item.units === maxUnits && item.units > 0) { score += 15; wins.push("Most Units"); }
      if (item.available > 0) { score += 10; }
      item.score = score;
      item.wins = wins;
      item.priceBar = maxPrice > 0 ? (item.price / maxPrice) * 100 : 0;
      item.areaBar = maxArea > 0 ? (item.area / maxArea) * 100 : 0;
      item.unitsBar = maxUnits > 0 ? (item.units / maxUnits) * 100 : 0;
    });

    const winner = [...items].sort((a, b) => b.score - a.score)[0];
    return { items, winner, minPrice, maxArea };
  }, [properties]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative w-full max-w-2xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-serif text-lg text-[#111827]">Compare</h2>
            <p className="text-[11px] text-[#6b7280]">{properties.length} properties side by side</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f2f2f2] transition-colors"><X size={16} className="text-[#6b7280]" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 space-y-5">

          {/* Property Cards Row */}
          <div className={`grid gap-3 ${properties.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {metrics.items.map(item => (
              <div key={item.id} className={`relative rounded-xl border p-3 ${metrics.winner.id === item.id ? "border-[#0f4c3a] bg-[#0f4c3a]/[0.03]" : "border-[#e5e7eb]"}`}>
                {metrics.winner.id === item.id && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#D4A017] text-[#111827] text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm whitespace-nowrap">
                    <Crown size={9} /> BEST MATCH
                  </div>
                )}
                <div className="w-full h-20 rounded-lg overflow-hidden bg-[#f2f2f2] mb-2">
                  <img src={item.image || ""} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                </div>
                <h3 className="font-serif text-sm text-[#111827] leading-tight truncate mb-0.5">{item.title}</h3>
                <p className="text-[10px] text-[#6b7280] truncate">{item.location || item.city}</p>
              </div>
            ))}
          </div>

          {/* Comparison Bars */}
          <div className="space-y-4">
            {/* Price */}
            <CompareMetric label="Monthly Rent" icon="€">
              {metrics.items.map(item => (
                <MetricBar
                  key={item.id}
                  value={`€${item.price.toLocaleString()}`}
                  pct={item.priceBar}
                  isBest={item.price === metrics.minPrice && item.price > 0}
                  color="bg-[#22C55E]"
                  invertBar
                />
              ))}
            </CompareMetric>

            {/* Area */}
            <CompareMetric label="Size" icon="m²">
              {metrics.items.map(item => (
                <MetricBar
                  key={item.id}
                  value={item.area > 0 ? `${item.area} m²` : "—"}
                  pct={item.areaBar}
                  isBest={item.area === metrics.maxArea && item.area > 0}
                  color="bg-[#0f4c3a]"
                />
              ))}
            </CompareMetric>

            {/* Units */}
            <CompareMetric label="Units Available" icon="#">
              {metrics.items.map(item => (
                <MetricBar
                  key={item.id}
                  value={`${item.available} of ${item.units}`}
                  pct={item.unitsBar}
                  isBest={item.available === Math.max(...metrics.items.map(i => i.available)) && item.available > 0}
                  color="bg-[#0f4c3a]/70"
                />
              ))}
            </CompareMetric>

            {/* Amenities */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Highlights</p>
              <div className={`grid gap-3 ${properties.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {metrics.items.map(item => (
                  <div key={item.id} className="space-y-1">
                    {item.amenities.slice(0, 4).map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check size={10} className="text-[#22C55E] shrink-0" />
                        <span className="text-[10px] text-[#374151] truncate">{a}</span>
                      </div>
                    ))}
                    {item.furnished && (
                      <div className="flex items-center gap-1.5">
                        <Check size={10} className="text-[#22C55E] shrink-0" />
                        <span className="text-[10px] text-[#374151]">Furnished</span>
                      </div>
                    )}
                    {item.amenities.length === 0 && !item.furnished && (
                      <span className="text-[10px] text-[#d1d5db]">No data</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Winner Footer */}
        {metrics.winner.wins.length > 0 && (
          <div className="px-5 py-3 bg-[#0f4c3a] shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-[#D4A017] rounded-full text-[#111827]"><Trophy size={12} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-serif">
                  <span className="text-[#D4A017] italic">{metrics.winner.title}</span> wins
                </p>
                <p className="text-[10px] text-white/50">{metrics.winner.wins.join(" · ")}</p>
              </div>
              <button onClick={onClose} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#D4A017] border border-[#D4A017]/30 text-[9px] font-bold uppercase tracking-widest rounded-full transition-all">Done</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const CompareMetric = ({ label, children }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2">{label}</p>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const MetricBar = ({ value, pct, isBest, color, invertBar }) => (
  <div className="flex items-center gap-2">
    <span className={`text-xs w-20 shrink-0 text-right ${isBest ? "font-bold text-[#111827]" : "text-[#6b7280]"}`}>{value}</span>
    <div className="flex-1 h-2 bg-[#f2f2f2] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${isBest ? color : "bg-[#d1d5db]"}`}
        style={{ width: `${invertBar ? (100 - pct + (pct > 0 ? 20 : 0)) : pct}%`, minWidth: pct > 0 ? '8px' : '0' }}
      />
    </div>
    {isBest && <Check size={12} className="text-[#22C55E] shrink-0" />}
  </div>
);

const Pagination = ({ current, total, count, perPage, onChange }) => (
  <div className="flex items-center justify-between pt-3">
    <p className="text-[11px] text-[#9ca3af]">
      {(current - 1) * perPage + 1}–{Math.min(current * perPage, count)} of {count}
    </p>
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1}
        className="w-8 h-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#374151] hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs">
        ‹
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map(page => (
        <button key={page} onClick={() => onChange(page)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${current === page ? "bg-[#0f4c3a] text-white" : "border border-[#e5e7eb] text-[#374151] hover:bg-[#f7f7f7]"}`}>
          {page}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(total, current + 1))} disabled={current === total}
        className="w-8 h-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#374151] hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs">
        ›
      </button>
    </div>
  </div>
);

const EmptyTabState = ({ icon: Icon, title, desc }) => (
  <div className="bg-white rounded-2xl border border-[#e5e7eb] p-10 text-center">
    <div className="w-12 h-12 bg-[#f2f2f2] rounded-full flex items-center justify-center mx-auto mb-3">
      <Icon size={20} className="text-[#9ca3af]" />
    </div>
    <h3 className="text-sm font-bold text-[#111827] mb-1">{title}</h3>
    <p className="text-xs text-[#6b7280] max-w-sm mx-auto mb-4">{desc}</p>
    <Link to="/search" className="inline-flex px-5 py-2 rounded-full bg-[#0f4c3a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-all">Browse Stays</Link>
  </div>
);

export default Wishlist;
