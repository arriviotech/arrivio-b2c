import { useMemo, useCallback } from 'react';
import { Search as SearchIcon, ListFilter, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import SearchTabs from './SearchTabs';

const SearchControlBar = ({ activeTab, setActiveTab, searchTerm, setSearchTerm, onSearch, filters, setFilters, onOpenFilters, onReset }) => {

  // ── Active filter count ──
  const activeFilterCount = useMemo(() => {
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
  }, [filters]);

  // ── Build chips for active filters ──
  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.city !== "All") {
      chips.push({ key: 'city', label: filters.city });
    }
    if (filters.availableFrom) {
      const s = new Date(filters.availableFrom).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const e = filters.availableTo ? new Date(filters.availableTo).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;
      chips.push({ key: 'date', label: e ? `${s} → ${e}` : `From ${s}` });
    }
    if (filters.priceMin > 0 || filters.priceMax < 2000) {
      chips.push({ key: 'price', label: `€${filters.priceMin} – €${filters.priceMax}` });
    }
    (filters.propertyTypes || []).forEach(type => {
      chips.push({ key: `type-${type}`, label: type });
    });
    (filters.tags || []).forEach(tag => {
      chips.push({ key: `tag-${tag}`, label: tag });
    });
    if (filters.floor !== "Any") {
      chips.push({ key: 'floor', label: `Floor: ${filters.floor}` });
    }
    if (filters.furniture !== "Any") {
      chips.push({ key: 'furniture', label: filters.furniture });
    }
    return chips;
  }, [filters]);

  const removeChip = useCallback((chip) => {
    setFilters(prev => {
      switch (chip.key) {
        case 'city': return { ...prev, city: "All" };
        case 'date': return { ...prev, availableFrom: null, availableTo: null };
        case 'price': return { ...prev, priceMin: 0, priceMax: 2000 };
        case 'floor': return { ...prev, floor: "Any" };
        case 'furniture': return { ...prev, furniture: "Any" };
        default:
          if (chip.key.startsWith('type-')) {
            const type = chip.key.replace('type-', '');
            return { ...prev, propertyTypes: (prev.propertyTypes || []).filter(t => t !== type) };
          }
          if (chip.key.startsWith('tag-')) {
            const tag = chip.key.replace('tag-', '');
            return { ...prev, tags: (prev.tags || []).filter(t => t !== tag) };
          }
          return prev;
      }
    });
  }, [setFilters]);

  return (
    <div className="sticky top-0 z-30 bg-[#f2f2f2] border-b border-[#0f4c3a]/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col gap-2.5">

        {/* Row 1 (mobile): Search + Filter | Row 1 (desktop): Tabs + Search + Filter */}
        <div className="flex items-center gap-2.5">
          {/* Tabs — hidden on mobile */}
          <div className="hidden md:block">
            <SearchTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Search — always visible, grows on mobile */}
          <div className="relative flex-1 md:flex-none md:w-56 lg:w-64 md:ml-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" size={15} />
            <input
              type="text"
              placeholder="Search city or landmark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSearch(searchTerm); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#e5e7eb] focus:border-[#0f4c3a]/20 rounded-full text-sm font-medium text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-4 focus:ring-[#0f4c3a]/5 transition-all shadow-sm"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => onOpenFilters(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeFilterCount > 0
                ? 'border-[#0f4c3a] bg-[#0f4c3a] text-white shadow-md hover:bg-[#0a3a2b]'
                : 'border-[#d1d5db] bg-white text-[#111827] shadow-sm hover:border-[#0f4c3a]/40 hover:shadow-md'
            }`}
          >
            <ListFilter size={15} className={activeFilterCount > 0 ? 'text-white' : 'text-[#6b7280]'} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-white text-[#0f4c3a] text-[11px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Row 2 (mobile only): Tabs */}
        <div className="md:hidden">
          <SearchTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <AnimatePresence>
              {activeChips.map((chip) => (
                <motion.button
                  key={chip.key}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => removeChip(chip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e5e7eb] text-[#374151] text-xs font-medium whitespace-nowrap hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors group shadow-sm"
                >
                  <span>{chip.label}</span>
                  <X size={12} className="text-[#9ca3af] group-hover:text-red-500 transition-colors" />
                </motion.button>
              ))}
            </AnimatePresence>
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#9ca3af] hover:text-[#111827] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#e5e7eb] transition-all whitespace-nowrap"
            >
              <RotateCcw size={11} />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchControlBar;
