import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { COUNTRIES } from "../../utils/countries";

const OTHER = { name: "Other", iso2: "__other", dial: "", flag: "" };

/**
 * Searchable country dropdown — type a country name (or dial code) to filter.
 *
 * mode="phone"   → trigger shows just "flag +49"; value/onChange use the dial code.
 * mode="country" → trigger shows the country name; value/onChange use the name.
 *
 * Set includeOther (country mode) to append an "Other" entry at the end.
 */
const CountrySelect = ({
  mode = "country",
  value,
  onChange,
  disabled = false,
  placeholder = "Select country",
  includeOther = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const baseOptions = useMemo(
    () => (mode === "country" && includeOther ? [...COUNTRIES, OTHER] : COUNTRIES),
    [mode, includeOther]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseOptions;
    const qDigits = q.replace(/[^\d]/g, "");
    return baseOptions.filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (mode === "phone" && qDigits && c.dial.replace("+", "").includes(qDigits)) return true;
      return false;
    });
  }, [query, baseOptions, mode]);

  // Selected option (for trigger + checkmark)
  const selected =
    mode === "phone"
      ? COUNTRIES.find((c) => c.dial === value)
      : baseOptions.find((c) => c.name === value);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Focus search box when opening (DOM side-effect only)
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  const openMenu = () => {
    setQuery("");
    setActiveIndex(0);
    setIsOpen(true);
  };

  // Keep the highlighted row scrolled into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const handleSelect = (opt) => {
    onChange(mode === "phone" ? opt.dial : opt.name);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) handleSelect(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isPhone = mode === "phone";
  const triggerClass = isPhone
    ? "w-[92px] flex items-center justify-between gap-1 bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-2.5 py-2.5 text-sm text-[#111827] font-medium shrink-0 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    : `w-full flex items-center justify-between gap-1 bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors ${
        selected ? "text-[#111827]" : "text-[#9ca3af]"
      }`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        className={triggerClass}
      >
        <span className="truncate">
          {isPhone
            ? `${selected?.flag || "🌐"} ${selected?.dial || value || ""}`
            : selected
            ? `${selected.flag ? selected.flag + " " : ""}${selected.name}`
            : placeholder}
        </span>
        <ChevronDown size={14} className={`text-[#9ca3af] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 ${isPhone ? "left-0 w-64" : "left-0 right-0"} bg-white border border-[#e5e7eb] rounded-xl shadow-xl overflow-hidden z-[60]`}
        >
          {/* Search box */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e5e7eb]">
            <Search size={13} className="text-[#9ca3af] shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a country…"
              className="w-full bg-transparent text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none"
            />
          </div>

          {/* Options */}
          <div ref={listRef} className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3.5 py-3 text-xs text-[#9ca3af]">No matches</p>
            ) : (
              filtered.map((c, i) => {
                const isSel = isPhone ? c.dial === value : c.name === value;
                return (
                  <button
                    key={c.iso2}
                    type="button"
                    data-idx={i}
                    onClick={() => handleSelect(c)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors ${
                      i === activeIndex ? "bg-[#0f4c3a]/5" : ""
                    } ${isSel ? "text-[#111827] font-semibold" : "text-[#4b5563]"}`}
                  >
                    {c.flag && <span className="shrink-0">{c.flag}</span>}
                    <span className="flex-1 truncate">{c.name}</span>
                    {isPhone && c.dial && <span className="text-[#9ca3af] shrink-0">{c.dial}</span>}
                    {isSel && <Check size={13} className="text-[#0f4c3a] shrink-0" strokeWidth={2.5} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
