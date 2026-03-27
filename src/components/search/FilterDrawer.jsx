import { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { X, Check, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAmenityIcon } from '@/components/property/AmenitiesSection';

// ─── Date Picker Custom Header ───────────────────────────────
const DateCustomHeader = ({ monthDate, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
  <div className="flex items-center justify-between px-1 py-2">
    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="hover:bg-gray-100 p-1.5 rounded-full text-[#111827] transition-colors disabled:opacity-0">
      <ChevronLeft size={18} />
    </button>
    <div className="text-sm font-bold text-[#111827] flex items-center gap-1">
      <span>{monthDate.toLocaleString("default", { month: "long" })}</span>
      <span>{monthDate.getFullYear()}</span>
    </div>
    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="hover:bg-gray-100 p-1.5 rounded-full text-[#111827] transition-colors disabled:opacity-0">
      <ChevronRight size={18} />
    </button>
  </div>
);

// ─── Date Section Content ────────────────────────────────────
const DateContent = ({ filters, setFilters }) => {
  const moveInDate = filters.availableFrom ? new Date(filters.availableFrom) : null;

  const handleDateChange = (date) => {
    setFilters(prev => ({ ...prev, availableFrom: date, availableTo: null }));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="custom-datepicker-wrapper transform scale-[0.92] origin-top">
        <DatePicker
          selected={moveInDate}
          onChange={handleDateChange}
          inline
          monthsShown={1}
          minDate={new Date(new Date().setHours(0, 0, 0, 0))}
          renderCustomHeader={DateCustomHeader}
          calendarClassName="border-none font-sans"
          dayClassName={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) ? "past-day" : "day-cell"}
        />
      </div>
      <style>{`
        .custom-datepicker-wrapper .react-datepicker { border: none !important; font-family: inherit !important; display: flex !important; }
        .custom-datepicker-wrapper .react-datepicker__month-container { padding: 0 0.5rem !important; }
        .custom-datepicker-wrapper .react-datepicker__header { background: white !important; border-bottom: none !important; padding-top: 0 !important; margin-bottom: -10px !important; }
        .custom-datepicker-wrapper .react-datepicker__day-name { color: #9ca3af !important; width: 2.2rem !important; line-height: 2.2rem !important; margin: 0.1rem !important; font-weight: 500 !important; font-size: 0.75rem !important; }
        .custom-datepicker-wrapper .react-datepicker__day { width: 2.2rem !important; line-height: 2.2rem !important; margin: 0.1rem !important; border-radius: 9999px !important; font-weight: 500 !important; color: #374151; font-size: 0.8rem !important; }
        .custom-datepicker-wrapper .react-datepicker__day:hover { background-color: #f3f4f6 !important; color: #111827 !important; }
        .custom-datepicker-wrapper .react-datepicker__day--disabled, .custom-datepicker-wrapper .past-day { color: #9ca3af !important; background-color: transparent !important; opacity: 0.2 !important; cursor: not-allowed !important; pointer-events: none !important; }
        .custom-datepicker-wrapper .react-datepicker__day--selected { background-color: #0f4c3a !important; color: white !important; border-radius: 50% !important; opacity: 1 !important; }
        .custom-datepicker-wrapper .react-datepicker__day--keyboard-selected { background-color: transparent !important; color: inherit !important; }
        .custom-datepicker-wrapper .react-datepicker__day--outside-month { visibility: hidden !important; pointer-events: none !important; }
      `}</style>
    </div>
  );
};

// ─── Price Section Content ───────────────────────────────────
const PriceContent = ({ filters, setFilters, properties }) => {
  const minPrice = filters.priceMin || 0;
  const maxPrice = filters.priceMax || 2000;
  const maxLimit = 2000;

  const setMinPrice = (val) => setFilters(prev => ({ ...prev, priceMin: val }));
  const setMaxPrice = (val) => setFilters(prev => ({ ...prev, priceMax: val }));

  const getPercent = (v) => Math.round((v / maxLimit) * 100);

  // Build histogram from real data
  const histogramBars = useMemo(() => {
    const bucketCount = 25;
    const step = maxLimit / bucketCount;
    const buckets = new Array(bucketCount).fill(0);
    (properties || []).forEach(p => {
      if (p.price != null && p.price < maxLimit) {
        const idx = Math.min(Math.floor(p.price / step), bucketCount - 1);
        buckets[idx]++;
      }
    });
    const max = Math.max(...buckets, 1);
    return buckets.map(c => c === 0 ? 0.05 : c / max);
  }, [properties, maxLimit]);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[#111827] font-bold text-base">Price range</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500">
          Euros (€)
        </div>
      </div>

      {/* Histogram */}
      <div className="h-14 flex items-end gap-[2px] mb-2 px-1">
        {histogramBars.map((h, i) => {
          const barPrice = (i / histogramBars.length) * maxLimit;
          const isActive = barPrice >= minPrice && barPrice <= maxPrice;
          return <div key={i} className={`flex-1 rounded-t-sm transition-colors duration-200 ${isActive ? 'bg-[#0f4c3a]' : 'bg-gray-200'}`} style={{ height: `${h * 100}%` }} />;
        })}
      </div>

      {/* Range Slider */}
      <div className="relative h-6 mb-6 select-none">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2" />
        <div className="absolute top-1/2 h-1 bg-[#0f4c3a] rounded-full -translate-y-1/2 z-10" style={{ left: `${getPercent(minPrice)}%`, width: `${getPercent(maxPrice) - getPercent(minPrice)}%` }} />
        <input type="range" min={0} max={maxLimit} value={minPrice} onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20" style={{ pointerEvents: 'none' }} />
        <input type="range" min={0} max={maxLimit} value={maxPrice} onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20" style={{ pointerEvents: 'none' }} />
        <div className="absolute top-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md -translate-y-1/2 -translate-x-1/2 flex items-center justify-center z-30 pointer-events-none" style={{ left: `${getPercent(minPrice)}%` }}>
          <div className="w-2 h-[10px] border-l border-r border-gray-300" />
        </div>
        <div className="absolute top-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md -translate-y-1/2 -translate-x-1/2 flex items-center justify-center z-30 pointer-events-none" style={{ left: `${getPercent(maxPrice)}%` }}>
          <div className="w-2 h-[10px] border-l border-r border-gray-300" />
        </div>
        <style>{`input[type=range]::-webkit-slider-thumb { pointer-events: auto; width: 24px; height: 24px; -webkit-appearance: none; cursor: pointer; background: transparent; }`}</style>
      </div>

      {/* Number inputs */}
      <div className="flex gap-4">
        <div className="border border-gray-300 rounded-lg px-3 py-2 w-full focus-within:ring-1 focus-within:ring-[#0f4c3a] focus-within:border-[#0f4c3a]">
          <div className="text-xs text-gray-500 mb-0.5">Minimum</div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-1">€</span>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-full text-[#111827] outline-none font-medium text-sm" />
          </div>
        </div>
        <div className="border border-gray-300 rounded-lg px-3 py-2 w-full focus-within:ring-1 focus-within:ring-[#0f4c3a] focus-within:border-[#0f4c3a]">
          <div className="text-xs text-gray-500 mb-0.5">Maximum</div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-1">€</span>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full text-[#111827] outline-none font-medium text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Property Type Section Content ───────────────────────────
const PropertyTypeContent = ({ filters, setFilters }) => {
  const propertyTypes = filters.propertyTypes || [];
  const options = [
    { id: 'Shared room', label: 'Shared room' },
    { id: 'Private room', label: 'Private room' },
    { id: 'Studio', label: 'Studio' },
    { id: 'Apartment', label: 'Apartment' },
    { id: 'Student residence', label: 'Student residence' },
  ];

  const toggleType = (type) => {
    setFilters(prev => {
      const current = prev.propertyTypes || [];
      const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
      return { ...prev, propertyTypes: next };
    });
  };

  return (
    <div>
      <h3 className="text-[#111827] font-bold text-base mb-4">Property type</h3>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={propertyTypes.includes(opt.id)}
                onChange={() => toggleType(opt.id)}
                className="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-[#0f4c3a] checked:bg-[#0f4c3a] hover:border-[#0f4c3a]"
              />
              <Check size={14} className="absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
            </div>
            <span className={`text-sm font-medium transition-colors ${propertyTypes.includes(opt.id) ? 'text-[#111827]' : 'text-slate-600'}`}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// ─── Amenities Section Content ───────────────────────────────
const AmenitiesContent = ({ filters, setFilters, availableAmenities }) => {
  const selectedTags = filters.tags || [];
  const { grouped, categoryLabels, categoryOrder } = availableAmenities;
  const [expandedCategories, setExpandedCategories] = useState(() => {
    // Expand first 3 categories by default
    const initial = {};
    categoryOrder.slice(0, 3).forEach(c => { initial[c] = true; });
    return initial;
  });

  const toggleTag = (tag) => {
    setFilters(prev => {
      const current = prev.tags || [];
      const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
      return { ...prev, tags: next };
    });
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (categoryOrder.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No amenities available
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[#111827] font-bold text-base mb-4">Amenities & Facilities</h3>
      <div className="space-y-3">
        {categoryOrder.map((category) => {
          const items = grouped[category] || [];
          const isExpanded = expandedCategories[category];
          const selectedInCategory = items.filter(i => selectedTags.includes(i)).length;

          return (
            <div key={category} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#111827]">
                    {categoryLabels[category] || category}
                  </span>
                  {selectedInCategory > 0 && (
                    <span className="bg-[#0f4c3a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {selectedInCategory}
                    </span>
                  )}
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
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
                    <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                      {items.map((item) => (
                        <label key={item} className="flex items-center gap-2.5 cursor-pointer group select-none">
                          <div className="relative flex items-center justify-center shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(item)}
                              onChange={() => toggleTag(item)}
                              className="peer h-[18px] w-[18px] appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-[#0f4c3a] checked:bg-[#0f4c3a] hover:border-[#0f4c3a]"
                            />
                            <Check size={12} className="absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                          </div>
                          <span className="text-slate-500 shrink-0">{getAmenityIcon(item)}</span>
                          <span className={`text-[13px] font-medium transition-colors truncate ${selectedTags.includes(item) ? 'text-[#111827]' : 'text-slate-600'}`}>
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
    </div>
  );
};

// ─── Clear handler per section ───────────────────────────────
const getClearHandler = (section, setFilters) => {
  switch (section) {
    case 'Dates': return () => setFilters(prev => ({ ...prev, availableFrom: null, availableTo: null }));
    case 'Price': return () => setFilters(prev => ({ ...prev, priceMin: 0, priceMax: 2000 }));
    case 'PropertyType': return () => setFilters(prev => ({ ...prev, propertyTypes: [] }));
    case 'Amenities': return () => setFilters(prev => ({ ...prev, tags: [] }));
    default: return () => {};
  }
};

// ─── Main FilterDrawer ───────────────────────────────────────
const FilterDrawer = ({ activeSection, onClose, filters, setFilters, listingCount, properties, availableAmenities }) => {
  const drawerRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const renderContent = () => {
    switch (activeSection) {
      case 'Dates': return <DateContent filters={filters} setFilters={setFilters} />;
      case 'Price': return <PriceContent filters={filters} setFilters={setFilters} properties={properties} />;
      case 'PropertyType': return <PropertyTypeContent filters={filters} setFilters={setFilters} />;
      case 'Amenities': return <AmenitiesContent filters={filters} setFilters={setFilters} availableAmenities={availableAmenities} />;
      default: return null;
    }
  };

  const handleClear = getClearHandler(activeSection, setFilters);

  return (
    <>
      {/* ── Desktop: inline dropdown below filter bar (no portal) ── */}
      <div className="hidden md:block">
        {/* Backdrop — fixed covers whole page, clicks close drawer */}
        <div className="fixed inset-0 bg-black/10 z-[29]" onClick={onClose} />

        {/* Drawer panel — absolute to sticky parent */}
        <div
          ref={drawerRef}
          className="absolute left-0 right-0 top-full z-[31] px-4 md:px-8 pt-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                {renderContent()}
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button onClick={handleClear} className="text-[#111827] font-medium text-sm hover:underline">
                  Clear
                </button>
                <button onClick={onClose} className="bg-[#0f4c3a] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0a3a2b] transition-all shadow-sm hover:shadow-md">
                  {listingCount != null ? `Show ${listingCount} places` : 'Show results'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: bottom sheet (portaled to body) ── */}
      {ReactDOM.createPortal(
        <div className="md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[9998]" onClick={onClose} />

          {/* Bottom sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-base font-bold text-[#111827]">
                {activeSection === 'Dates' && 'Move-in date'}
                {activeSection === 'Price' && 'Price range'}
                {activeSection === 'PropertyType' && 'Property type'}
                {activeSection === 'Amenities' && 'Amenities & Facilities'}
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
              {renderContent()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 shrink-0 pb-safe">
              <button onClick={handleClear} className="text-[#111827] font-medium text-sm hover:underline">
                Clear
              </button>
              <button onClick={onClose} className="bg-[#0f4c3a] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#0a3a2b] transition-all shadow-sm">
                {listingCount != null ? `Show ${listingCount} places` : 'Show results'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FilterDrawer;
