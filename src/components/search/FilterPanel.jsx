import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, MapPin, Layers, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';
import { getAmenityIcon } from '@/components/property/AmenitiesSection';

// =========================================================
// 1. PRICE HISTOGRAM
// =========================================================
const PriceHistogram = ({ properties, currentMax, maxLimit = 5000 }) => {
  const bars = useMemo(() => {
    const bucketCount = 20;
    const step = maxLimit / bucketCount;
    const buckets = new Array(bucketCount).fill(0);

    const safeProperties = properties || [];
    safeProperties.forEach(p => {
      if (p.price < maxLimit) {
        const index = Math.floor(p.price / step);
        if (index >= 0 && index < bucketCount) {
          buckets[index]++;
        }
      }
    });

    const maxFrequency = Math.max(...buckets, 1);
    return buckets.map(count => count === 0 ? 0.1 : (count / maxFrequency));
  }, [properties, maxLimit]);

  return (
    <div className="flex items-end gap-[2px] h-10 w-full mb-2 px-1">
      {bars.map((heightPercent, i) => {
        const barPricePosition = (i / bars.length) * maxLimit;
        const isActive = barPricePosition < currentMax;
        return (
          <div
            key={i}
            className={`flex-1 rounded-t-[1px] transition-colors duration-300 ${isActive ? 'bg-[#556B5C]' : 'bg-[#0f4c3a]/10'}`}
            style={{ height: `${heightPercent * 100}%` }}
          />
        );
      })}
    </div>
  );
};

// =========================================================
// 2. CUSTOM DROPDOWN (Compact)
// =========================================================
// eslint-disable-next-line no-unused-vars
const CustomDropdown = ({ label, icon: Icon, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <span className="block text-[9px] font-bold uppercase tracking-widest text-[#4b5563] mb-1.5 ml-1">
        {label}
      </span>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full flex items-center justify-between bg-white rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold text-[#111827] transition-all border border-slate-200
                    ${isOpen ? 'ring-1 ring-[#0f4c3a]/10 shadow-md border-[#0f4c3a]/20' : 'hover:border-slate-300 shadow-sm'}`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={12} className={`text-[#111827]/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#111827]/30" size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[110] max-h-48 overflow-y-auto no-scrollbar"
          >
            {options.map((option) => (
              <div
                key={option}
                onClick={() => { onChange(option); setIsOpen(false); }}
                className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors flex justify-between items-center ${value === option ? 'bg-[#0f4c3a]/5 text-[#111827]' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {option}
                {value === option && <Check size={12} className="text-[#111827]" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =========================================================
// 3. MAIN FILTER PANEL (Refined & Compact)
// =========================================================
const FilterPanel = ({ isVisible, filters, setFilters, onReset, onClose, properties = [], availableAmenities, totalCount }) => {
  const scrollContainerRef = useRef(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const CITIES = useMemo(() => {
    const uniqueCities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)));
    return ["All", ...uniqueCities.sort()];
  }, [properties]);

  const PROPERTY_TYPES = ["Shared room", "Private room", "Studio", "Apartment", "Student residence"];
  const FLOORS = ["Any", "Ground", "1st", "2nd", "3rd", "4th", "5th+"];

  const toggleTag = (tag) => {
    setFilters(prev => {
      const current = prev.tags || [];
      const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
      return { ...prev, tags: next };
    });
  };

  const togglePropertyType = (type) => {
    setFilters(prev => {
      const current = prev.propertyTypes || [];
      const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
      return { ...prev, propertyTypes: next };
    });
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Use dynamic amenities if available, fallback to hardcoded
  const hasAmenities = availableAmenities && availableAmenities.categoryOrder?.length > 0;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Content Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[100000] flex flex-col max-h-[90vh] md:max-h-[85vh]"
          >
            {/* Mobile Grabber */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-4 mb-2 shrink-0 md:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <h2 className="text-base font-bold text-[#111827] tracking-tight">All Filters</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-6 pb-6 space-y-8 no-scrollbar"
            >
              {/* 1. PRICE RANGE */}
              <section className="pt-6">
                <div className="flex justify-between items-end mb-3 px-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#4b5563]">Price range</span>
                  <span className="text-[11px] font-bold text-[#111827] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    €{filters.priceMin} - €{filters.priceMax}
                  </span>
                </div>
                <div className="px-1">
                  <PriceHistogram properties={properties} currentMax={filters.priceMax} maxLimit={2000} />
                  <div className="relative h-2 flex items-center mb-2">
                    <div className="w-full relative h-[2px]">
                      <input
                        type="range" min="0" max="2000" step="50"
                        value={filters.priceMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceMin: parseInt(e.target.value) }))}
                        className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#556B5C] absolute top-0 left-0 z-10"
                      />
                      <input
                        type="range" min="0" max="2000" step="50"
                        value={filters.priceMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceMax: parseInt(e.target.value) }))}
                        className="w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer accent-[#0f4c3a] absolute top-0 left-0 z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-300 mt-1 px-0.5">
                    <span>€0</span>
                    <span>€2k+</span>
                  </div>
                </div>
              </section>

              {/* 2. LOCATION */}
              <section>
                <CustomDropdown
                  label="Location"
                  icon={MapPin}
                  value={filters.city}
                  options={CITIES}
                  onChange={(val) => setFilters(prev => ({ ...prev, city: val }))}
                />
              </section>

              {/* 3. PROPERTY TYPE */}
              <section>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-[#4b5563] mb-3 ml-1">Property type</span>
                <div className="flex flex-wrap gap-1.5 px-0.5">
                  {PROPERTY_TYPES.map(type => {
                    const isActive = filters.propertyTypes?.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => togglePropertyType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${isActive
                          ? 'bg-[#0f4c3a] text-white border-[#0f4c3a] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        {isActive && <Check size={10} strokeWidth={3} />}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 4. FLOOR NUMBER */}
              <section>
                <CustomDropdown
                  label="Floor level"
                  icon={Layers}
                  value={filters.floor}
                  options={FLOORS}
                  onChange={(val) => setFilters(prev => ({ ...prev, floor: val }))}
                />
              </section>

              {/* 5. AMENITIES & FACILITIES (Dynamic) */}
              <section>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-[#4b5563] mb-3 ml-1">Amenities & Facilities</span>
                {hasAmenities ? (
                  <div className="space-y-2">
                    {availableAmenities.categoryOrder.map((category) => {
                      const items = availableAmenities.grouped[category] || [];
                      const isExpanded = expandedCategories[category] !== false; // default expanded
                      const selectedInCategory = items.filter(i => filters.tags?.includes(i)).length;

                      return (
                        <div key={category} className="border border-slate-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-[#111827]">
                                {availableAmenities.categoryLabels[category] || category}
                              </span>
                              <span className="text-[10px] text-slate-400">({items.length})</span>
                              {selectedInCategory > 0 && (
                                <span className="bg-[#0f4c3a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                  {selectedInCategory}
                                </span>
                              )}
                            </div>
                            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3.5 pb-3 grid grid-cols-2 gap-x-4 gap-y-2">
                                  {items.map(item => (
                                    <label key={item} className="flex items-center gap-2 cursor-pointer group select-none">
                                      <div className="relative flex items-center justify-center shrink-0">
                                        <input
                                          type="checkbox"
                                          checked={filters.tags?.includes(item)}
                                          onChange={() => toggleTag(item)}
                                          className="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white transition-all checked:border-[#0f4c3a] checked:bg-[#0f4c3a] hover:border-[#0f4c3a]"
                                        />
                                        <Check size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3.5} />
                                      </div>
                                      <span className="text-slate-400 shrink-0">{getAmenityIcon(item)}</span>
                                      <span className={`text-[11px] font-medium transition-colors truncate ${filters.tags?.includes(item) ? 'text-[#111827]' : 'text-slate-500 hover:text-slate-600'}`}>
                                        {item}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic px-1">No amenities available for current properties</p>
                )}
              </section>

              {/* 6. FURNITURE */}
              <section>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-[#4b5563] mb-3 ml-1">Furniture</span>
                <div className="flex gap-2">
                  {['Any', 'Furnished', 'Semi-Furnished', 'Unfurnished'].map(option => {
                    const isActive = filters.furniture === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFilters(prev => ({ ...prev, furniture: option }))}
                        className={`flex-1 text-center py-2.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${isActive
                          ? 'bg-[#0f4c3a] text-white border-[#0f4c3a] shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
              <button
                onClick={onReset}
                className="px-4 py-2 text-[11px] font-bold text-slate-400 hover:text-[#111827] transition-all"
              >
                Reset all
              </button>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-2xl bg-[#0f4c3a] text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
              >
                {totalCount != null ? `Show ${totalCount} results` : 'Show results'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FilterPanel;
