import { useState, useEffect } from 'react';
import { ListFilter, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

const SearchFiltersBar = ({ onOpenFilters, onReset, filters, setFilters }) => {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsStuck(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Active filter count ──
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.city !== "All") count++;
    if (filters.priceMin > 0 || filters.priceMax < 2000) count++;
    if (filters.availableFrom) count++;
    if (filters.availableTo) count++;
    if (filters.propertyTypes?.length > 0) count++;
    if (filters.tags?.length > 0) count++;
    if (filters.floor !== "Any") count++;
    if (filters.furniture !== "Any") count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // ── Build chips for active filters ──
  const getActiveChips = () => {
    const chips = [];
    if (filters.city !== "All") {
      chips.push({ key: 'city', label: filters.city, onRemove: () => setFilters(prev => ({ ...prev, city: "All" })) });
    }
    if (filters.availableFrom) {
      const startStr = new Date(filters.availableFrom).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const endStr = filters.availableTo ? new Date(filters.availableTo).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;
      chips.push({
        key: 'date',
        label: endStr ? `${startStr} → ${endStr}` : `From ${startStr}`,
        onRemove: () => setFilters(prev => ({ ...prev, availableFrom: null, availableTo: null }))
      });
    }
    if (filters.priceMin > 0 || filters.priceMax < 2000) {
      chips.push({ key: 'price', label: `€${filters.priceMin} – €${filters.priceMax}`, onRemove: () => setFilters(prev => ({ ...prev, priceMin: 0, priceMax: 2000 })) });
    }
    (filters.propertyTypes || []).forEach(type => {
      chips.push({ key: `type-${type}`, label: type, onRemove: () => setFilters(prev => ({ ...prev, propertyTypes: (prev.propertyTypes || []).filter(t => t !== type) })) });
    });
    (filters.tags || []).forEach(tag => {
      chips.push({ key: `tag-${tag}`, label: tag, onRemove: () => setFilters(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) })) });
    });
    if (filters.floor !== "Any") {
      chips.push({ key: 'floor', label: `Floor: ${filters.floor}`, onRemove: () => setFilters(prev => ({ ...prev, floor: "Any" })) });
    }
    if (filters.furniture !== "Any") {
      chips.push({ key: 'furniture', label: filters.furniture, onRemove: () => setFilters(prev => ({ ...prev, furniture: "Any" })) });
    }
    return chips;
  };

  const activeChips = getActiveChips();

  return (
    <div className={`sticky top-0 z-30 bg-[#f2f2f2] px-4 md:px-8 transition-all duration-300 ease-in-out ${isStuck ? 'py-3 shadow-sm' : 'py-2.5'}`}>
      <div className="max-w-7xl mx-auto">

        {/* ── Single row: Filter button + chips ── */}
        <div className="flex items-center gap-3">

          {/* Filter button */}
          <button
            onClick={() => onOpenFilters(null)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all whitespace-nowrap group ${
              activeFilterCount > 0
                ? 'border-[#0f4c3a] bg-[#0f4c3a] text-white shadow-md hover:bg-[#0a3a2b]'
                : 'border-[#d1d5db] bg-white text-[#111827] shadow-sm hover:border-[#0f4c3a]/40 hover:shadow-md'
            }`}
          >
            <ListFilter size={15} className={`transition-transform group-hover:scale-110 ${activeFilterCount > 0 ? 'text-white' : 'text-[#6b7280]'}`} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-white text-[#0f4c3a] text-[11px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Chips — inline, scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
            <AnimatePresence>
              {activeChips.map((chip) => (
                <motion.button
                  key={chip.key}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={chip.onRemove}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e5e7eb] text-[#374151] text-xs font-medium whitespace-nowrap hover:border-[#ef4444]/30 hover:bg-red-50 hover:text-red-600 transition-colors group shadow-sm"
                >
                  <span>{chip.label}</span>
                  <X size={12} className="text-[#9ca3af] group-hover:text-red-500 transition-colors" />
                </motion.button>
              ))}
            </AnimatePresence>

            {/* Clear all — only when chips exist */}
            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#9ca3af] hover:text-[#111827] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#e5e7eb] transition-all whitespace-nowrap"
              >
                <RotateCcw size={11} />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFiltersBar;
