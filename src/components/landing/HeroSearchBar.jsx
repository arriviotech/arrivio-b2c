import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeroDatePicker from './HeroDatePicker';

const HeroSearchBar = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(null); // 'location' | 'moveIn' | 'moveOut' | null
    const locationRef = useRef(null);
    const dateRef = useRef(null);

    const locations = [
        "Aachen", "Berlin", "Bonn", "Cologne",
        "Dusseldorf", "Frankfurt", "Hamburg", "Munich"
    ];

    const handleSearch = () => {
        // Save dates globally so unit pages can pick them up
        if (startDate || endDate) {
            sessionStorage.setItem('arrivio_search_dates', JSON.stringify({
                start: startDate?.toISOString() || null,
                end: endDate?.toISOString() || null,
            }));
        }
        navigate('/search', {
            state: {
                location: location || 'All',
                date: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null
            }
        });
    };

    // Lock scroll when date picker is open
    React.useEffect(() => {
        if (isDatePickerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isDatePickerOpen]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationRef.current && !locationRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                if (!dateRef.current || !dateRef.current.contains(event.target)) {
                    setActiveSection(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatShort = (date) => {
        if (!date) return null;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const dateDisplay = startDate && endDate
        ? `${formatShort(startDate)} - ${formatShort(endDate)}`
        : startDate
            ? `${formatShort(startDate)} - End`
            : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full max-w-xl md:max-w-lg mx-auto mb-2 md:mb-8 relative z-50 px-4"
        >
            {/* ═══ MOBILE — twin glass pills + search ═══ */}
            <div className="md:hidden space-y-3" ref={locationRef}>
                {/* City pill */}
                <div className="relative">
                    <button
                        onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsDatePickerOpen(false); }}
                        className="w-full flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/25 p-1.5 shadow-xl active:bg-white/20 transition-colors"
                    >
                        <div className="flex-1 flex items-center gap-2 px-3 py-2">
                            <MapPin size={16} className="text-white/50 shrink-0" />
                            <span className="text-[14px] font-medium text-white truncate">{location || "All Germany"}</span>
                        </div>
                        <ChevronDown size={14} className={`text-white/40 mr-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl py-2 max-h-60 overflow-y-auto z-50"
                            >
                                <button onClick={() => { setLocation(""); setIsDropdownOpen(false); }}
                                    className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${!location ? 'text-[#0f4c3a] bg-[#0f4c3a]/5' : 'text-[#374151] hover:bg-[#f7f7f7]'}`}>
                                    All Germany
                                </button>
                                {locations.map(city => (
                                    <button key={city} onClick={() => { setLocation(city); setIsDropdownOpen(false); }}
                                        className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between ${location === city ? 'text-[#0f4c3a] bg-[#0f4c3a]/5' : 'text-[#374151] hover:bg-[#f7f7f7]'}`}>
                                        {city}
                                        {location === city && <div className="w-2 h-2 rounded-full bg-[#0f4c3a]" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Date + Search pill */}
                <div className="relative" ref={dateRef}>
                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/25 p-1.5 shadow-xl">
                        <button
                            onClick={() => { setIsDatePickerOpen(!isDatePickerOpen); setIsDropdownOpen(false); }}
                            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full text-left active:bg-white/10 transition-colors"
                        >
                            <Calendar size={16} className="text-white/50 shrink-0" />
                            <span className={`text-[14px] font-medium truncate ${dateDisplay ? 'text-white' : 'text-white/50'}`}>
                                {dateDisplay || "When are you moving?"}
                            </span>
                        </button>

                        <button
                            onClick={handleSearch}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0f4c3a] shadow-md active:scale-95 transition-all shrink-0"
                        >
                            <Search size={17} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {isDatePickerOpen && (
                            <HeroDatePicker
                                startDate={startDate}
                                endDate={endDate}
                                onDatesChange={(start, end) => {
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                                onClose={() => setIsDatePickerOpen(false)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ═══ DESKTOP FORM — horizontal pill ═══ */}
            <div className={`hidden md:flex rounded-full shadow-2xl flex-row items-stretch relative transition-all duration-300 ${activeSection ? 'bg-white/70 backdrop-blur-md border border-white/20' : 'bg-white/90 backdrop-blur-md border border-white/20 hover:bg-white/95'}`}>

                {/* Location */}
                <div ref={locationRef} className="relative flex-1 min-w-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveSection(activeSection === 'location' ? null : 'location');
                            setIsDropdownOpen(!isDropdownOpen);
                            setIsDatePickerOpen(false);
                        }}
                        className={`w-full h-full flex items-center justify-center py-3 px-2 rounded-full transition-all duration-200 ${activeSection === 'location' ? 'bg-white shadow-lg scale-[1.01]' : 'hover:bg-white/50'}`}
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-0.5">Location</p>
                            <div className="flex items-center justify-center gap-1.5">
                                <p className={`text-[15px] font-serif font-semibold truncate ${location ? 'text-[#111827]' : 'text-[#9ca3af]'}`}>
                                    {location || "All Germany"}
                                </p>
                                <ChevronDown size={12} className={`text-[#9ca3af] transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                    </button>

                    {/* Green accent line when filled */}
                    {location && (
                        <motion.div layoutId="locationAccent" className="absolute bottom-1.5 left-6 right-6 h-[2px] rounded-full bg-[#0f4c3a]/30" />
                    )}

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                className="absolute top-full left-0 w-full mt-3 bg-white rounded-2xl shadow-2xl border border-[#f0f0f0] py-2 max-h-64 overflow-y-auto no-scrollbar z-50"
                            >
                                <button onClick={() => { setLocation(""); setIsDropdownOpen(false); setActiveSection(null); }}
                                    className="w-full text-left px-6 py-3 hover:bg-[#F9FAF9] text-[#1f2937] hover:text-[#111827] font-sans text-sm transition-colors border-b border-[#f2f2f2]/60">
                                    All Germany
                                </button>
                                {locations.map(city => (
                                    <button key={city} onClick={() => { setLocation(city); setIsDropdownOpen(false); setActiveSection(null); }}
                                        className="w-full text-left px-6 py-3 hover:bg-[#F9FAF9] text-[#1f2937] hover:text-[#111827] font-sans text-sm transition-colors flex items-center justify-between">
                                        {city}
                                        {location === city && <div className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Divider — hidden when adjacent section is active */}
                <div className={`w-[1px] self-center h-8 transition-opacity duration-200 ${activeSection === 'location' || activeSection === 'moveIn' ? 'opacity-0' : 'bg-[#111827]/10 opacity-100'}`} />

                {/* Move-in */}
                <div className="relative flex-1 min-w-0" ref={dateRef}>
                    <button
                        className={`w-full h-full flex items-center justify-center px-4 py-3 rounded-full transition-all duration-200 ${activeSection === 'moveIn' ? 'bg-white shadow-lg scale-[1.01]' : 'hover:bg-white/50'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveSection('moveIn');
                            setIsDatePickerOpen(true);
                            setIsDropdownOpen(false);
                        }}
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-0.5">Move-in</p>
                            <p className={`text-[15px] font-serif font-semibold truncate ${startDate ? 'text-[#111827]' : 'text-[#9ca3af]'}`}>
                                {formatShort(startDate) || "Add date"}
                            </p>
                        </div>
                    </button>

                    {startDate && (
                        <motion.div layoutId="moveInAccent" className="absolute bottom-1.5 left-6 right-6 h-[2px] rounded-full bg-[#0f4c3a]/30" />
                    )}
                </div>

                {/* Divider */}
                <div className={`w-[1px] self-center h-8 transition-opacity duration-200 ${activeSection === 'moveIn' || activeSection === 'moveOut' ? 'opacity-0' : 'bg-[#111827]/10 opacity-100'}`} />

                {/* Move-out */}
                <div className="relative flex-1 min-w-0">
                    <button
                        className={`w-full h-full flex items-center justify-center px-4 py-3 rounded-full transition-all duration-200 ${activeSection === 'moveOut' ? 'bg-white shadow-lg scale-[1.01]' : 'hover:bg-white/50'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveSection('moveOut');
                            setIsDatePickerOpen(true);
                            setIsDropdownOpen(false);
                        }}
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-0.5">Move-out</p>
                            <p className={`text-[15px] font-serif font-semibold truncate ${endDate ? 'text-[#111827]' : 'text-[#9ca3af]'}`}>
                                {formatShort(endDate) || "Add date"}
                            </p>
                        </div>
                    </button>

                    {endDate && (
                        <motion.div layoutId="moveOutAccent" className="absolute bottom-1.5 left-6 right-6 h-[2px] rounded-full bg-[#0f4c3a]/30" />
                    )}
                </div>

                {/* Search Button */}
                <div className="pr-1.5 flex items-center">
                    <button
                        onClick={handleSearch}
                        className="w-12 h-12 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group"
                    >
                        <Search size={18} className="transition-transform group-hover:scale-110" />
                    </button>
                </div>

                {/* Date Picker Panel */}
                <AnimatePresence>
                    {isDatePickerOpen && (
                        <HeroDatePicker
                            startDate={startDate}
                            endDate={endDate}
                            onDatesChange={(start, end) => {
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            onClose={() => { setIsDatePickerOpen(false); setActiveSection(null); }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default HeroSearchBar;
