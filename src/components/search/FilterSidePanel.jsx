import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { X, Check, ChevronDown, MapPin, Layers, ArrowRight } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getAmenityIcon } from '@/components/property/AmenitiesSection';

// ─── Date constants ──────────────────────────────────────────
const MONTHS_LIST = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUICK_DURATIONS = [
  { label: '3 mo', days: 90 },
  { label: '6 mo', days: 180 },
  { label: '1 year', days: 365 },
  { label: '2 years', days: 730 },
];

const formatDateShort = (date) => {
  if (!date) return null;
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const getDurationText = (start, end) => {
  if (!start || !end) return null;
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const weeks = Math.floor((diffDays % 30) / 7);
  const days = (diffDays % 30) % 7;
  const parts = [];
  if (months > 0) parts.push(`${months}mo`);
  if (weeks > 0) parts.push(`${weeks}w`);
  if (days > 0) parts.push(`${days}d`);
  return parts.length > 0 ? parts.join(' ') : '0 days';
};

// ─── Date Picker Custom Header (with month/year jump) ────────
const DateCustomHeader = ({ monthDate, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled, changeMonth, changeYear }) => {
  const [showJump, setShowJump] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <div className="flex items-center justify-between px-2 py-2 relative">
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1.5 rounded-full text-[#374151] hover:bg-[#0f4c3a]/5 transition-colors disabled:opacity-0">
        <ChevronLeft size={16} />
      </button>
      <button onClick={() => setShowJump(!showJump)} className="text-[13px] font-bold text-[#111827] flex items-center gap-1 hover:text-[#0f4c3a] transition-colors">
        {monthDate.toLocaleString("default", { month: "long" })} {monthDate.getFullYear()}
        <ChevronDown size={12} className={`transition-transform ${showJump ? 'rotate-180' : ''}`} />
      </button>
      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1.5 rounded-full text-[#374151] hover:bg-[#0f4c3a]/5 transition-colors disabled:opacity-0">
        <ChevronRight size={16} />
      </button>
      {showJump && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-xl border border-[#f0f0f0] p-3 z-50 w-[220px]" onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex flex-wrap gap-1.5 mb-2.5 pb-2.5 border-b border-[#f0f0f0]">
            {years.map(y => (
              <button key={y} onClick={() => changeYear(y)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${monthDate.getFullYear() === y ? 'bg-[#0f4c3a] text-white' : 'text-[#374151] hover:bg-[#f3f4f6]'}`}>{y}</button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {MONTHS_LIST.map((m, i) => (
              <button key={m} onClick={() => { changeMonth(i); setShowJump(false); }} className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${monthDate.getMonth() === i ? 'bg-[#0f4c3a] text-white' : 'text-[#374151] hover:bg-[#f3f4f6]'}`}>{m}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Custom Dropdown ─────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const CustomDropdown = ({ label, icon: Icon, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
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

// ─── Date Section (HeroDatePicker-style) ─────────────────────
const DateSectionContent = ({ filters, setFilters }) => {
  const startDate = filters.availableFrom ? new Date(filters.availableFrom) : null;
  const endDate = filters.availableTo ? new Date(filters.availableTo) : null;
  const [activeField, setActiveField] = useState('start');
  const [hoverDate, setHoverDate] = useState(null);
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilters(prev => ({ ...prev, availableFrom: start, availableTo: end }));
    if (start && !end) setActiveField('end');
    // Sync to global sessionStorage
    if (start || end) {
      sessionStorage.setItem('arrivio_search_dates', JSON.stringify({
        start: start?.toISOString() || null,
        end: end?.toISOString() || null,
      }));
    }
  };

  const handleQuickDuration = (days) => {
    const start = startDate || today;
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setFilters(prev => ({ ...prev, availableFrom: start, availableTo: end }));
    setActiveField('end');
    sessionStorage.setItem('arrivio_search_dates', JSON.stringify({
      start: start.toISOString(),
      end: end.toISOString(),
    }));
  };

  const handleClear = () => {
    setFilters(prev => ({ ...prev, availableFrom: null, availableTo: null }));
    setActiveField('start');
  };

  const durationText = getDurationText(startDate, endDate || hoverDate);

  return (
    <div>
      {/* Move-in / Move-out fields */}
      <div className="flex items-center gap-2.5 mb-3">
        <button
          onClick={() => setActiveField('start')}
          className={`flex-1 relative px-4 py-3 rounded-xl border-2 transition-all text-left ${
            activeField === 'start'
              ? 'border-[#0f4c3a] bg-[#0f4c3a]/[0.04] shadow-sm'
              : 'border-[#e5e7eb] bg-white hover:border-[#9ca3af]'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mb-0.5">Move-in</p>
          <p className={`text-[13px] font-semibold ${startDate ? 'text-[#111827]' : 'text-[#9ca3af]'}`}>
            {formatDateShort(startDate) || 'Pick a date'}
          </p>
          {activeField === 'start' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0f4c3a] animate-pulse" />}
        </button>

        <ArrowRight size={14} className="text-[#9ca3af] shrink-0" />

        <button
          onClick={() => { if (startDate) setActiveField('end'); }}
          className={`flex-1 relative px-4 py-3 rounded-xl border-2 transition-all text-left ${
            activeField === 'end'
              ? 'border-[#0f4c3a] bg-[#0f4c3a]/[0.04] shadow-sm'
              : 'border-[#e5e7eb] bg-white hover:border-[#9ca3af]'
          } ${!startDate ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mb-0.5">Move-out</p>
          <p className={`text-[13px] font-semibold ${endDate ? 'text-[#111827]' : 'text-[#9ca3af]'}`}>
            {formatDateShort(endDate) || 'Pick a date'}
          </p>
          {activeField === 'end' && startDate && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0f4c3a] animate-pulse" />}
        </button>
      </div>

      {/* Quick durations */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b0b5bc]">Stay:</span>
        {QUICK_DURATIONS.map(({ label, days }) => (
          <button
            key={days}
            onClick={() => handleQuickDuration(days)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a] hover:text-[#0f4c3a] hover:bg-[#0f4c3a]/5 transition-all"
          >
            {label}
          </button>
        ))}
        {durationText && (
          <span className="ml-auto text-[11px] font-bold text-[#0f4c3a] bg-[#0f4c3a]/5 px-2.5 py-1 rounded-full">
            {durationText}
          </span>
        )}
      </div>

      {/* Calendar */}
      <div className="sidepanel-datepicker flex justify-center">
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
          monthsShown={1}
          minDate={today}
          onDayMouseEnter={(date) => setHoverDate(date)}
          onDayMouseLeave={() => setHoverDate(null)}
          renderCustomHeader={(props) => <DateCustomHeader {...props} />}
          calendarClassName="border-none font-sans"
          dayClassName={(date) => date < today ? "sdp-past" : "sdp-day"}
        />
      </div>

      {/* Clear */}
      {(startDate || endDate) && (
        <div className="flex justify-center mt-2">
          <button onClick={handleClear} className="text-xs font-medium text-slate-400 hover:text-[#111827] hover:underline">
            Clear dates
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Price Histogram ─────────────────────────────────────────
const PriceHistogram = ({ properties, currentMin, currentMax, maxLimit = 2000 }) => {
  const bars = useMemo(() => {
    const bucketCount = 20;
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
    <div className="flex items-end gap-[2px] h-12 w-full mb-2 px-1">
      {bars.map((h, i) => {
        const barPrice = (i / bars.length) * maxLimit;
        const isActive = barPrice >= currentMin && barPrice <= currentMax;
        return <div key={i} className={`flex-1 rounded-t-sm transition-colors duration-200 ${isActive ? 'bg-[#0f4c3a]' : 'bg-gray-200'}`} style={{ height: `${h * 100}%` }} />;
      })}
    </div>
  );
};

// ─── Section wrapper ─────────────────────────────────────────
const FilterSection = ({ id, title, children }) => (
  <section id={`filter-section-${id}`} className="pb-6 border-b border-slate-100 last:border-b-0">
    <h3 className="text-sm font-bold text-[#111827] mb-4">{title}</h3>
    {children}
  </section>
);

// ═════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════
const FilterSidePanel = ({
  isOpen,
  onClose,
  scrollToSection,
  filters,
  setFilters,
  onReset,
  properties = [],
  availableAmenities,
  totalCount,
}) => {
  const scrollContainerRef = useRef(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Auto-scroll to section when opened via a specific pill
  useEffect(() => {
    if (isOpen && scrollToSection) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`filter-section-${scrollToSection}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, scrollToSection]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // ── Derived data ──
  const CITIES = useMemo(() => {
    const uniqueCities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)));
    return ["All", ...uniqueCities.sort()];
  }, [properties]);

  const PROPERTY_TYPES = ["Shared room", "Private room", "Studio", "Apartment", "Student residence"];
  const FLOORS = ["Any", "Ground", "1st", "2nd", "3rd", "4th", "5th+"];

  const hasAmenities = availableAmenities && availableAmenities.categoryOrder?.length > 0;

  // ── Filter handlers ──
  const toggleTag = useCallback((tag) => {
    setFilters(prev => {
      const current = prev.tags || [];
      const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
      return { ...prev, tags: next };
    });
  }, [setFilters]);

  const togglePropertyType = useCallback((type) => {
    setFilters(prev => {
      const current = prev.propertyTypes || [];
      const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
      return { ...prev, propertyTypes: next };
    });
  }, [setFilters]);

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Price helpers
  const minPrice = filters.priceMin || 0;
  const maxPrice = filters.priceMax || 2000;
  const maxLimit = 2000;
  const getPercent = (v) => Math.round((v / maxLimit) * 100);

  // ── Desktop panel (inline, not portaled) ──
  const panelContent = (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar"
    >
      {/* ── DATES ── */}
      <FilterSection id="Dates" title="Select dates">
        <DateSectionContent filters={filters} setFilters={setFilters} />
      </FilterSection>

      {/* ── PRICE RANGE ── */}
      <FilterSection id="Price" title="Price range">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-[#111827]">€{minPrice} – €{maxPrice}</span>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">EUR</span>
        </div>
        <PriceHistogram properties={properties} currentMin={minPrice} currentMax={maxPrice} maxLimit={maxLimit} />
        <div className="relative h-6 mb-4 select-none">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2" />
          <div className="absolute top-1/2 h-1 bg-[#0f4c3a] rounded-full -translate-y-1/2 z-10" style={{ left: `${getPercent(minPrice)}%`, width: `${getPercent(maxPrice) - getPercent(minPrice)}%` }} />
          <input type="range" min={0} max={maxLimit} value={minPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, priceMin: Math.min(Number(e.target.value), prev.priceMax - 100) }))}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20" style={{ pointerEvents: 'none' }} />
          <input type="range" min={0} max={maxLimit} value={maxPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, priceMax: Math.max(Number(e.target.value), prev.priceMin + 100) }))}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20" style={{ pointerEvents: 'none' }} />
          <div className="absolute top-1/2 w-5 h-5 bg-white border-2 border-[#0f4c3a] rounded-full shadow-md -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-none" style={{ left: `${getPercent(minPrice)}%` }} />
          <div className="absolute top-1/2 w-5 h-5 bg-white border-2 border-[#0f4c3a] rounded-full shadow-md -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-none" style={{ left: `${getPercent(maxPrice)}%` }} />
          <style>{`input[type=range]::-webkit-slider-thumb { pointer-events: auto; width: 20px; height: 20px; -webkit-appearance: none; cursor: pointer; background: transparent; }`}</style>
        </div>
        <div className="flex gap-3">
          <div className="border border-gray-200 rounded-lg px-3 py-2 w-full focus-within:ring-1 focus-within:ring-[#0f4c3a] focus-within:border-[#0f4c3a]">
            <div className="text-[10px] text-gray-400 mb-0.5">Min</div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-1 text-sm">€</span>
              <input type="number" value={minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: Number(e.target.value) }))}
                className="w-full text-[#111827] outline-none font-medium text-sm" />
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg px-3 py-2 w-full focus-within:ring-1 focus-within:ring-[#0f4c3a] focus-within:border-[#0f4c3a]">
            <div className="text-[10px] text-gray-400 mb-0.5">Max</div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-1 text-sm">€</span>
              <input type="number" value={maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }))}
                className="w-full text-[#111827] outline-none font-medium text-sm" />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* ── LOCATION ── */}
      <FilterSection id="Location" title="Location">
        <CustomDropdown
          icon={MapPin}
          value={filters.city}
          options={CITIES}
          onChange={(val) => setFilters(prev => ({ ...prev, city: val }))}
        />
      </FilterSection>

      {/* ── PROPERTY TYPE ── */}
      <FilterSection id="PropertyType" title="Property type">
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map(type => {
            const isActive = filters.propertyTypes?.includes(type);
            return (
              <button
                key={type}
                onClick={() => togglePropertyType(type)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${isActive
                  ? 'bg-[#0f4c3a] text-white border-[#0f4c3a] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {isActive && <Check size={10} strokeWidth={3} />}
                {type}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* ── FLOOR LEVEL ── */}
      <FilterSection id="Floor" title="Floor level">
        <CustomDropdown
          icon={Layers}
          value={filters.floor}
          options={FLOORS}
          onChange={(val) => setFilters(prev => ({ ...prev, floor: val }))}
        />
      </FilterSection>

      {/* ── AMENITIES & FACILITIES ── */}
      <FilterSection id="Amenities" title="Amenities & Facilities">
        {hasAmenities ? (
          <div className="space-y-2">
            {availableAmenities.categoryOrder.map((category) => {
              const items = availableAmenities.grouped[category] || [];
              const isExpanded = expandedCategories[category] !== false; // default open
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
                        <div className="px-3.5 pb-3 flex flex-col gap-2">
                          {items.map(item => (
                            <label key={item} className="flex items-center gap-2.5 cursor-pointer select-none">
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
                              <span className={`text-[12px] font-medium transition-colors ${filters.tags?.includes(item) ? 'text-[#111827]' : 'text-slate-500'}`}>
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
          <p className="text-xs text-slate-400 italic">No amenities available</p>
        )}
      </FilterSection>

      {/* ── FURNITURE ── */}
      <FilterSection id="Furniture" title="Furniture">
        <div className="flex flex-col gap-2">
          {['Any', 'Furnished', 'Semi-Furnished', 'Unfurnished'].map(option => {
            const isActive = filters.furniture === option;
            return (
              <button
                key={option}
                onClick={() => setFilters(prev => ({ ...prev, furniture: option }))}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${isActive
                  ? 'bg-[#0f4c3a] text-white border-[#0f4c3a] shadow-sm'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );

  // ── Single overlay panel — fixed to right edge, full height, portaled ──
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20"
            onClick={onClose}
          />

          {/* Right panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-[580px] bg-white border-l border-slate-200 shadow-2xl flex flex-col"
          >
            {/* Header — compact */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-[#111827]">Filters</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Scrollable content */}
            {panelContent}

            {/* Footer — compact */}
            <div className="px-6 py-2.5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 pb-safe">
              <button onClick={onReset} className="text-xs font-semibold text-slate-400 hover:text-[#111827] transition-all">
                Clear all
              </button>
              <button onClick={onClose} className="px-6 py-2 rounded-lg bg-[#0f4c3a] text-xs font-bold text-white shadow-sm hover:shadow-md transition-all">
                {totalCount != null ? `Show ${totalCount} results` : 'Show results'}
              </button>
            </div>

            {/* Date picker styles (matches HeroDatePicker) */}
            <style>{`
              .sidepanel-datepicker .react-datepicker { border: none !important; font-family: inherit !important; display: flex !important; background: transparent !important; }
              .sidepanel-datepicker .react-datepicker__month-container { padding: 0 0.25rem !important; background: transparent !important; width: 100% !important; }
              .sidepanel-datepicker .react-datepicker__header { background: transparent !important; border-bottom: none !important; padding-top: 0 !important; }
              .sidepanel-datepicker .react-datepicker__day-names { margin-bottom: 2px !important; }
              .sidepanel-datepicker .react-datepicker__day-name { color: #9ca3af !important; width: 2.8rem !important; line-height: 2.2rem !important; margin: 0.05rem !important; font-weight: 700 !important; font-size: 0.65rem !important; text-transform: uppercase; letter-spacing: 0.05em; }
              .sidepanel-datepicker .react-datepicker__day { width: 2.8rem !important; line-height: 2.8rem !important; margin: 0.05rem !important; border-radius: 9999px !important; font-weight: 500 !important; color: #374151; font-size: 0.85rem !important; transition: all 0.12s ease; }
              .sidepanel-datepicker .react-datepicker__day:hover { background-color: rgba(15,76,58,0.06) !important; color: #0f4c3a !important; }
              .sidepanel-datepicker .react-datepicker__day--disabled, .sidepanel-datepicker .sdp-past { color: #9ca3af !important; background-color: transparent !important; opacity: 0.7 !important; cursor: not-allowed !important; pointer-events: none !important; }
              .sidepanel-datepicker .react-datepicker__day--in-range,
              .sidepanel-datepicker .react-datepicker__day--in-selecting-range { background-color: rgba(15,76,58,0.07) !important; color: #0f4c3a !important; border-radius: 0 !important; }
              .sidepanel-datepicker .react-datepicker__day--selected,
              .sidepanel-datepicker .react-datepicker__day--range-start,
              .sidepanel-datepicker .react-datepicker__day--range-end,
              .sidepanel-datepicker .react-datepicker__day--selecting-range-start { background-color: #0f4c3a !important; color: white !important; border-radius: 9999px !important; opacity: 1 !important; font-weight: 700 !important; position: relative; z-index: 2; }
              .sidepanel-datepicker .react-datepicker__day--range-start { border-radius: 9999px 0 0 9999px !important; }
              .sidepanel-datepicker .react-datepicker__day--range-end { border-radius: 0 9999px 9999px 0 !important; }
              .sidepanel-datepicker .react-datepicker__day--range-start.react-datepicker__day--range-end { border-radius: 9999px !important; }
              .sidepanel-datepicker .react-datepicker__day--keyboard-selected { background-color: transparent !important; color: inherit !important; }
              .sidepanel-datepicker .react-datepicker__day--outside-month { visibility: hidden !important; pointer-events: none !important; }
              .sidepanel-datepicker .react-datepicker__day--today { font-weight: 800 !important; position: relative; }
              .sidepanel-datepicker .react-datepicker__day--today:not(.react-datepicker__day--selected):not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end)::after { content: ''; position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background-color: #D4A017; }
            `}</style>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FilterSidePanel;
