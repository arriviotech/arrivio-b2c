import { useState, useEffect, useRef } from 'react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest first' },
  { value: 'availability', label: 'Availability' },
];

const SortDropdown = ({ sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const currentLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label;
  const isDefault = sortBy === 'relevance';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e5e7eb] rounded-lg shadow-sm hover:border-[#0f4c3a]/30 hover:shadow-md transition-all cursor-pointer"
      >
        <ArrowUpDown size={11} className="text-[#9ca3af]" />
        <span className="text-[11px] font-semibold text-[#111827] whitespace-nowrap">
          {isDefault ? 'Sort by' : currentLabel}
        </span>
        <ChevronDown size={11} className={`text-[#9ca3af] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.6 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-full mt-1.5 bg-white border border-[#e5e7eb] rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${
                  sortBy === opt.value
                    ? 'bg-[#0f4c3a]/5 text-[#111827] font-semibold'
                    : 'text-[#4b5563] hover:bg-slate-50'
                }`}
              >
                <span>{opt.label}</span>
                {sortBy === opt.value && <Check size={13} className="text-[#0f4c3a]" strokeWidth={2.5} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SortDropdown;
