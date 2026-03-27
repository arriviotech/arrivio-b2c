import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, ArrowRight, X, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const MONTHS_LIST = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomHeader = ({
    monthDate,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
    changeMonth,
    changeYear,
}) => {
    const [showJump, setShowJump] = useState(false);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

    return (
        <div className="flex items-center justify-between px-2 py-2.5 relative">
            <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="hero-dp-prev p-1.5 rounded-full text-[#374151] hover:bg-[#0f4c3a]/5 transition-colors disabled:opacity-0"
            >
                <ChevronLeft size={16} />
            </button>

            <button
                onClick={() => setShowJump(!showJump)}
                className="text-[13px] font-bold text-[#111827] tracking-wide flex items-center gap-1 hover:text-[#0f4c3a] transition-colors"
            >
                {monthDate.toLocaleString("default", { month: "long" })} {monthDate.getFullYear()}
                <ChevronDown size={12} className={`transition-transform ${showJump ? 'rotate-180' : ''}`} />
            </button>

            <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="hero-dp-next p-1.5 rounded-full text-[#374151] hover:bg-[#0f4c3a]/5 transition-colors disabled:opacity-0"
            >
                <ChevronRight size={16} />
            </button>

            {showJump && (
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-xl border border-[#f0f0f0] p-3 z-50 w-[220px]"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-wrap gap-1.5 mb-2.5 pb-2.5 border-b border-[#f0f0f0]">
                        {years.map(y => (
                            <button
                                key={y}
                                onClick={() => { changeYear(y); }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                    monthDate.getFullYear() === y
                                        ? 'bg-[#0f4c3a] text-white'
                                        : 'text-[#374151] hover:bg-[#f3f4f6]'
                                }`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                        {MONTHS_LIST.map((m, i) => (
                            <button
                                key={m}
                                onClick={() => { changeMonth(i); setShowJump(false); }}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                    monthDate.getMonth() === i
                                        ? 'bg-[#0f4c3a] text-white'
                                        : 'text-[#374151] hover:bg-[#f3f4f6]'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const QUICK_DURATIONS = [
    { label: '3 mo', days: 90 },
    { label: '6 mo', days: 180 },
    { label: '1 year', days: 365 },
    { label: '2 years', days: 730 },
];

const formatDate = (date) => {
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

const HeroDatePicker = ({ startDate, endDate, onDatesChange, onClose }) => {
    const [localStart, setLocalStart] = useState(startDate);
    const [localEnd, setLocalEnd] = useState(endDate);
    const [hoverDate, setHoverDate] = useState(null);
    const [activeField, setActiveField] = useState('start');
    const containerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

    const today = new Date(new Date().setHours(0, 0, 0, 0));

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleClose = () => {
        document.body.style.overflow = '';
        onClose();
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setLocalStart(start);
        setLocalEnd(end);
        if (start && !end) setActiveField('end');
    };

    const handleQuickDuration = (days) => {
        const start = localStart || today;
        const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
        setLocalStart(start);
        setLocalEnd(end);
        setActiveField('end');
    };

    const handleApply = () => {
        onDatesChange(localStart, localEnd);
        handleClose();
    };

    const handleClear = () => {
        setLocalStart(null);
        setLocalEnd(null);
        setActiveField('start');
    };

    const durationText = getDurationText(localStart, localEnd || hoverDate);

    // ── Shared header content ──
    const headerContent = (
        <>
            {/* Close row */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9ca3af]">Select dates</p>
                <button
                    onClick={handleClose}
                    className="w-7 h-7 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:text-[#111827] transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Move-in / Move-out pills */}
            <div className="flex items-center gap-2.5 mb-3">
                <button
                    onClick={() => { setActiveField('start'); }}
                    className={`flex-1 relative px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        activeField === 'start'
                            ? 'border-[#0f4c3a] bg-[#0f4c3a]/[0.06] shadow-sm'
                            : 'border-[#d1d5db] bg-white hover:border-[#9ca3af]'
                    }`}
                >
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9ca3af] leading-none mb-1">Move-in</p>
                    <p className={`text-[14px] font-semibold leading-tight ${localStart ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
                        {formatDate(localStart) || 'Pick a date'}
                    </p>
                    {activeField === 'start' && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0f4c3a] animate-pulse" />
                    )}
                </button>

                <ArrowRight size={16} className="text-[#6b7280] shrink-0" />

                <button
                    onClick={() => { if (localStart) setActiveField('end'); }}
                    className={`flex-1 relative px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        activeField === 'end'
                            ? 'border-[#0f4c3a] bg-[#0f4c3a]/[0.06] shadow-sm'
                            : 'border-[#d1d5db] bg-white hover:border-[#9ca3af]'
                    } ${!localStart ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9ca3af] leading-none mb-1">Move-out</p>
                    <p className={`text-[14px] font-semibold leading-tight ${localEnd ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
                        {formatDate(localEnd) || 'Pick a date'}
                    </p>
                    {activeField === 'end' && localStart && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0f4c3a] animate-pulse" />
                    )}
                </button>
            </div>

            {/* Quick durations */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0b5bc] mr-0.5">Stay:</span>
                {QUICK_DURATIONS.map(({ label, days }) => (
                    <button
                        key={days}
                        onClick={() => handleQuickDuration(days)}
                        className="px-3.5 py-1.5 rounded-full text-[11px] font-bold border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a] hover:text-[#0f4c3a] hover:bg-[#0f4c3a]/5 active:scale-95 transition-all"
                    >
                        {label}
                    </button>
                ))}
                {durationText && (
                    <span className="ml-auto text-[12px] font-bold text-[#0f4c3a] bg-[#0f4c3a]/5 px-3 py-1 rounded-full">
                        {durationText}
                        {!localEnd && hoverDate && <span className="text-[#D4A017] ml-1">...</span>}
                    </span>
                )}
            </div>
        </>
    );

    // ── Shared footer content ──
    const footerContent = (
        <div className="flex items-center justify-between">
            <button
                onClick={handleClear}
                className="text-[13px] font-bold text-[#6b7280] hover:text-[#111827] underline underline-offset-2 decoration-[#d1d5db] hover:decoration-[#111827] transition-colors"
            >
                Clear dates
            </button>
            <button
                onClick={handleApply}
                className="px-8 py-2.5 rounded-xl text-sm font-bold transition-all bg-[#0f4c3a] text-white hover:bg-[#0a3a2b] shadow-lg shadow-[#0f4c3a]/20 hover:shadow-xl hover:shadow-[#0f4c3a]/25 active:scale-[0.97]"
            >
                Apply
            </button>
        </div>
    );

    // ── Calendar props (shared) ──
    const calendarProps = {
        selected: localStart,
        onChange: handleDateChange,
        startDate: localStart,
        endDate: localEnd,
        selectsRange: true,
        inline: true,
        minDate: today,
        onDayMouseEnter: (date) => setHoverDate(date),
        onDayMouseLeave: () => setHoverDate(null),
        renderCustomHeader: (props) => <CustomHeader {...props} />,
        calendarClassName: "border-none font-sans",
        dayClassName: (date) => date < today ? "hero-dp-past" : "hero-dp-day",
    };

    const content = (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={handleClose}
            />

            {/* ═══ MOBILE — full-screen bottom sheet ═══ */}
            {isMobile && (
                <motion.div
                    ref={containerRef}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="relative w-full h-[95dvh] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-[#d1d5db]" />
                    </div>

                    {/* Header — pinned */}
                    <div className="px-5 pt-2 pb-4 bg-gradient-to-b from-[#fafafa] to-white shrink-0">
                        {headerContent}
                    </div>

                    {/* Calendar — scrollable, 2 months stacked */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 border-t border-[#f0f0f0]">
                        <div className="hero-datepicker-wrapper hero-dp-mobile flex justify-center py-3">
                            <DatePicker
                                {...calendarProps}
                                monthsShown={2}
                            />
                        </div>
                    </div>

                    {/* Footer — pinned */}
                    <div className="px-5 py-4 border-t border-[#f0f0f0] bg-white shrink-0 safe-area-bottom">
                        {footerContent}
                    </div>
                </motion.div>
            )}

            {/* ═══ DESKTOP — centered card ═══ */}
            {!isMobile && (
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="relative mx-4 w-full max-w-[660px] bg-white rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 pt-4 pb-4 bg-gradient-to-b from-[#fafafa] to-white">
                        {headerContent}
                    </div>

                    {/* Calendar */}
                    <div className="px-4 py-2 flex justify-center border-t border-[#f0f0f0]">
                        <div className="hero-datepicker-wrapper">
                            <DatePicker
                                {...calendarProps}
                                monthsShown={2}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-[#f0f0f0] bg-[#fafafa]">
                        {footerContent}
                    </div>
                </motion.div>
            )}

            {/* Scoped calendar styles */}
            <style>{`
                .hero-datepicker-wrapper .react-datepicker {
                    border: none !important;
                    font-family: inherit !important;
                    display: flex !important;
                    background: transparent !important;
                    gap: 0;
                }
                /* Mobile: stack months vertically */
                .hero-dp-mobile .react-datepicker {
                    flex-direction: column !important;
                    gap: 0.5rem;
                }
                .hero-datepicker-wrapper .react-datepicker__month-container {
                    padding: 0 0.4rem !important;
                    background: transparent !important;
                }
                .hero-dp-mobile .react-datepicker__month-container {
                    width: 100% !important;
                }
                .hero-datepicker-wrapper .react-datepicker__header {
                    background: transparent !important;
                    border-bottom: none !important;
                    padding-top: 0 !important;
                }
                .hero-datepicker-wrapper .react-datepicker__day-names {
                    margin-bottom: 2px !important;
                }
                .hero-datepicker-wrapper .react-datepicker__day-name {
                    color: #9ca3af !important;
                    width: 2.4rem !important;
                    line-height: 2rem !important;
                    margin: 0.1rem !important;
                    font-weight: 700 !important;
                    font-size: 0.65rem !important;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .hero-dp-mobile .react-datepicker__day-name {
                    width: 2.6rem !important;
                    line-height: 2.2rem !important;
                    font-size: 0.7rem !important;
                }
                .hero-datepicker-wrapper .react-datepicker__day {
                    width: 2.4rem !important;
                    line-height: 2.4rem !important;
                    margin: 0.1rem !important;
                    border-radius: 9999px !important;
                    font-weight: 500 !important;
                    color: #374151;
                    font-size: 0.82rem !important;
                    transition: all 0.12s ease;
                }
                .hero-dp-mobile .react-datepicker__day {
                    width: 2.6rem !important;
                    line-height: 2.6rem !important;
                    font-size: 0.9rem !important;
                }
                .hero-datepicker-wrapper .react-datepicker__day:hover {
                    background-color: rgba(15, 76, 58, 0.06) !important;
                    color: #0f4c3a !important;
                    border-radius: 9999px !important;
                }
                .hero-datepicker-wrapper .react-datepicker__day--disabled,
                .hero-datepicker-wrapper .hero-dp-past {
                    color: #9ca3af !important;
                    background-color: transparent !important;
                    opacity: 0.7 !important;
                    cursor: not-allowed !important;
                    pointer-events: none !important;
                }

                /* In-range */
                .hero-datepicker-wrapper .react-datepicker__day--in-range,
                .hero-datepicker-wrapper .react-datepicker__day--in-selecting-range {
                    background-color: rgba(15, 76, 58, 0.07) !important;
                    color: #0f4c3a !important;
                    border-radius: 0 !important;
                }

                /* Start & end markers */
                .hero-datepicker-wrapper .react-datepicker__day--selected,
                .hero-datepicker-wrapper .react-datepicker__day--range-start,
                .hero-datepicker-wrapper .react-datepicker__day--range-end,
                .hero-datepicker-wrapper .react-datepicker__day--selecting-range-start {
                    background-color: #0f4c3a !important;
                    color: white !important;
                    border-radius: 9999px !important;
                    opacity: 1 !important;
                    font-weight: 700 !important;
                    position: relative;
                    z-index: 2;
                }
                .hero-datepicker-wrapper .react-datepicker__day--range-start {
                    border-radius: 9999px 0 0 9999px !important;
                }
                .hero-datepicker-wrapper .react-datepicker__day--range-end {
                    border-radius: 0 9999px 9999px 0 !important;
                }
                .hero-datepicker-wrapper .react-datepicker__day--range-start.react-datepicker__day--range-end {
                    border-radius: 9999px !important;
                }

                .hero-datepicker-wrapper .react-datepicker__day--keyboard-selected {
                    background-color: transparent !important;
                    color: inherit !important;
                }
                .hero-datepicker-wrapper .react-datepicker__day--outside-month {
                    visibility: hidden !important;
                    pointer-events: none !important;
                }

                /* Hide duplicate nav arrows between months */
                .hero-datepicker-wrapper .react-datepicker__month-container:first-of-type .hero-dp-next { visibility: hidden !important; }
                .hero-datepicker-wrapper .react-datepicker__month-container:last-of-type .hero-dp-prev { visibility: hidden !important; }

                /* Today highlight */
                .hero-datepicker-wrapper .react-datepicker__day--today {
                    font-weight: 800 !important;
                    position: relative;
                }
                .hero-datepicker-wrapper .react-datepicker__day--today:not(.react-datepicker__day--selected):not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end)::after {
                    content: '';
                    position: absolute;
                    bottom: 3px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: #D4A017;
                }

                /* Safe area for iOS bottom bar */
                .safe-area-bottom {
                    padding-bottom: max(1rem, env(safe-area-inset-bottom));
                }
            `}</style>
        </div>
    );

    return ReactDOM.createPortal(content, document.body);
};

export default HeroDatePicker;
