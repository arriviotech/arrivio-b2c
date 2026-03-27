import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, X, GripHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomHeader = ({
    monthDate,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
}) => {
    return (
        <div className="flex items-center justify-between px-1 py-2">
            <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="prev-btn hover:bg-gray-100 p-1.5 rounded-full text-[#111827] transition-colors disabled:opacity-0"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="text-sm font-bold text-[#111827] flex items-center gap-1">
                <span>{monthDate.toLocaleString("default", { month: "long" })}</span>
                <span>{monthDate.getFullYear()}</span>
            </div>

            <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="next-btn hover:bg-gray-100 p-1.5 rounded-full text-[#111827] transition-colors disabled:opacity-0"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

const BookingDateFilter = ({ startDate: propStart, endDate: propEnd, setDates, onClose, position, minStay, className = "" }) => {
    const [startDate, setStartDate] = useState(propStart);
    const [endDate, setEndDate] = useState(propEnd);
    const [hoverDate, setHoverDate] = useState(null);
    const containerRef = useRef(null);
    const datePickerRef = useRef(null);

    // Dynamic minDate for End Date
    const calculatedMinEndDate = startDate
        ? new Date(startDate.getTime() + (minStay * 24 * 60 * 60 * 1000))
        : new Date();

    // Scroll Lock logic
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // Handle click outside and Escape key to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('keydown', handleEscKey);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    const handleApply = () => {
        setDates(startDate, endDate);
        onClose();
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setDates(null, null);
    };

    // Calculate position to ensure it's visible on screen
    const getDropdownStyle = () => {
        // Fallback to center if no position or screen is too small
        if (!position || window.innerWidth < 800) return { position: 'relative' };

        // Ensure top/left are within safe bounds and not negative
        // Adding safety padding of 20px from screen edges
        const top = Math.max(20, Math.min(position.top + 20, window.innerHeight - 600));
        const left = Math.max(20, Math.min(position.left - 100, window.innerWidth - 740));

        return {
            position: 'absolute',
            top,
            left,
            margin: 0
        };
    };

    const content = (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
            {/* Darker Overlay when card is open */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/5 pointer-events-auto"
                onClick={onClose}
            />

            <motion.div
                ref={containerRef}
                drag
                dragMomentum={false}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`shadow-2xl bg-white rounded-[2rem] border border-[#f2f2f2] p-6 z-[9999] w-[620px] h-[500px] flex flex-col pointer-events-auto cursor-default relative ${className}`}
                style={getDropdownStyle()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Drag Handle Overlay (Subtle) */}
                <div className="absolute top-2 left-0 right-0 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100 transition-opacity z-[1001]">
                    <div className="w-12 h-1 bg-[#0f4c3a]/10 rounded-full" />
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors z-[1001]"
                >
                    <X size={20} />
                </button>

                <div className="mb-4 flex flex-col items-center select-none">
                    <h3 className="flex items-center justify-center gap-3 text-[#111827] font-serif font-bold text-2xl mb-1 text-center w-full uppercase tracking-tighter">
                        <span className={(!startDate || (startDate && endDate)) ? "opacity-100" : "opacity-30"}>Move In</span>
                        <span className="opacity-20 text-2xl">—</span>
                        <span className={startDate ? "opacity-100" : "opacity-30"}>Move Out</span>
                    </h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#9ca3af] font-bold mb-4">
                        {startDate && endDate ? "Residency range secured" : startDate ? "Pick a date after the minimum stay" : "Select your residency period"}
                    </p>
                    <div className="custom-datepicker-wrapper transform scale-[0.88] mb-4 origin-top">
                        <DatePicker
                            ref={datePickerRef}
                            selected={startDate}
                            onChange={(dates) => {
                                const [start, end] = dates;
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            inline
                            monthsShown={2}
                            minDate={new Date()}
                            onDayMouseEnter={(date) => setHoverDate(date)}
                            onDayMouseLeave={() => setHoverDate(null)}
                            // If startDate is selected, the "endDate" picker part effectively starts from startDate + minStay
                            // Note: selectsRange shows one calendar, we rely on validation or dayClassName to guide
                            renderCustomHeader={CustomHeader}
                            calendarClassName="border-none font-sans"
                            dayClassName={(date) => {
                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                if (isPast) return "past-day";

                                if (startDate && !endDate) {
                                    const isTooSoon = date < calculatedMinEndDate;
                                    if (isTooSoon && date > startDate) return "too-soon-day";
                                }

                                return "day-cell";
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
                     <div className="flex flex-col gap-1.5">
                        <div className="text-sm text-[#111827] font-bold">
                            {(startDate && (endDate || hoverDate)) ? (() => {
                                const targetDate = endDate || hoverDate;
                                if (!targetDate || targetDate < startDate) return "Select a range";

                                const diffDays = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
                                const months = Math.floor(diffDays / 30);
                                const remainingAfterMonths = diffDays % 30;
                                const weeks = Math.floor(remainingAfterMonths / 7);
                                const days = remainingAfterMonths % 7;

                                const parts = [];
                                if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
                                if (weeks > 0) parts.push(`${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`);
                                if (days > 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);

                                return (
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg text-[#111827]">{parts.length > 0 ? parts.join(', ') : '0 Days'}</span>
                                        {!endDate && hoverDate && <span className="text-xs font-bold text-[#D4A017] uppercase tracking-widest">(Picking...)</span>}
                                    </div>
                                );
                            })() : "Select a range"}
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#D4A017] shadow-sm" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#6b7280]">
                                Min Stay: {(() => {
                                    const months = Math.floor(minStay / 30);
                                    const days = minStay % 30;
                                    const parts = [];
                                    if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
                                    if (days > 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);
                                    return parts.length > 0 ? parts.join(', ') : '0 Days';
                                })()}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleClear}
                            className="px-5 py-2.5 rounded-xl border border-[#D1D9D9] text-[#111827] font-bold text-xs hover:bg-[#F4F6F5] transition-colors"
                        >
                            Clear all
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={!startDate || !endDate}
                            className={`bg-[#0f4c3a] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${!startDate || !endDate ? 'opacity-30 cursor-not-allowed grayscale-[0.5]' : 'hover:bg-[#1f2b22] hover:shadow-md active:scale-95'}`}
                        >
                            Apply dates
                        </button>
                    </div>
                </div>

                <style>{`
                .react-datepicker {
                    border: none !important;
                    font-family: inherit !important;
                    display: flex !important;
                }
                .react-datepicker__header {
                    background: white !important;
                    border-bottom: none !important;
                    padding-top: 0 !important;
                }
                .react-datepicker__day-name {
                    color: #9ca3af !important;
                    width: 2.1rem !important;
                    line-height: 2.1rem !important;
                    margin: 0.1rem !important;
                    font-weight: 500 !important;
                    font-size: 0.75rem !important;
                }
                .react-datepicker__day {
                    width: 2.1rem !important;
                    line-height: 2.1rem !important;
                    margin: 0.1rem !important;
                    border-radius: 9999px !important;
                    font-weight: 500 !important;
                    color: #374151;
                    font-size: 0.8rem !important;
                }
                .react-datepicker__day:hover {
                    background-color: #f3f4f6 !important;
                    color: #111827 !important;
                }
                 .react-datepicker__day--disabled, .past-day, .too-soon-day {
                     color: #9ca3af !important;
                     opacity: 0.4 !important;
                     cursor: not-allowed !important;
                     pointer-events: none !important;
                     text-decoration: line-through !important;
                 }
                .react-datepicker__day--in-range {
                    background-color: rgba(44, 62, 48, 0.08) !important;
                    color: #0f4c3a !important;
                    border-radius: 0 !important;
                }
                .react-datepicker__day--selected,
                .react-datepicker__day--range-start,
                .react-datepicker__day--range-end {
                    background-color: #0f4c3a !important;
                    color: white !important;
                    border-radius: 4px !important;
                    opacity: 1 !important;
                }
                .react-datepicker__day--range-start { border-radius: 4px 0 0 4px !important; }
                .react-datepicker__day--range-end { border-radius: 0 4px 4px 0 !important; }
                .react-datepicker__day--outside-month { visibility: hidden !important; }
                .react-datepicker__month-container:first-of-type .next-btn { visibility: hidden !important; }
                .react-datepicker__month-container:last-of-type .prev-btn { visibility: hidden !important; }
            `}</style>
            </motion.div>
        </div>
    );

    return ReactDOM.createPortal(content, document.body);
};

export default BookingDateFilter;
