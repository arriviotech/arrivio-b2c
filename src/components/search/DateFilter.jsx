import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight, Plus, Minus, X } from 'lucide-react';

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

const DateFilter = ({ filters, setFilters, onClose, position, listingCount, lockScroll = true, isAbsolute = false, className = "" }) => {
    // Date Mode State
    const [moveInDate, setMoveInDate] = useState(filters.availableFrom ? new Date(filters.availableFrom) : null);

    const isInternalChange = React.useRef(false);

    const containerRef = useRef(null);

    useEffect(() => {
        if (!lockScroll || isAbsolute) return;

        // Body scroll lock on mount
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [lockScroll, isAbsolute]);

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

        // Delay attaching to prevent immediate close if the trigger button is outside
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

    // Sync changes to filters for Date Mode
    useEffect(() => {
        if (!isInternalChange.current) {
            isInternalChange.current = true;
            setFilters(prev => ({
                ...prev,
                availableFrom: moveInDate,
                availableTo: null // Ensure endDate is cleared
            }));
            setTimeout(() => {
                isInternalChange.current = false;
            }, 50);
        }
    }, [moveInDate, setFilters]);

    useEffect(() => {
        // Sync internal state with props only when NOT an internal change
        if (isInternalChange.current) return;

        if (filters.availableFrom) {
            setMoveInDate(new Date(filters.availableFrom));
        } else {
            setMoveInDate(null);
        }
    }, [filters.availableFrom]);

    const handleApply = () => {
        // Real-time updates already happened, just close
        onClose();
    };

    const handleClear = () => {
        isInternalChange.current = true;
        setMoveInDate(null);
        setFilters(prev => ({
            ...prev,
            availableFrom: null,
            availableTo: null
        }));
        setTimeout(() => {
            isInternalChange.current = false;
        }, 50);
    };

    const content = (
        <div
            ref={containerRef}
            className={`${isAbsolute ? 'absolute shadow-xl' : 'fixed shadow-2xl'} bg-white rounded-2xl border border-[#f2f2f2] p-3 z-[9999] animate-in fade-in zoom-in-95 duration-200 ${className.includes('w-') ? '' : 'w-[360px]'} h-[380px] flex flex-col date-filter-portal pointer-events-auto ${className}`}
            style={isAbsolute ? {} : { top: position?.top || 0, left: position?.left || 0 }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Close Button */}
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors z-[1001]"
                aria-label="Close"
            >
                <X size={20} />
            </button>

            {/* DATE MODE */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                <div className="flex flex-col items-center mt-6">
                    <div className="custom-datepicker-wrapper transform scale-[0.85] origin-top mb-0">
                        <DatePicker
                            selected={moveInDate}
                            onChange={(date) => {
                                setMoveInDate(date);
                            }}
                            inline
                            monthsShown={1}
                            minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                            renderCustomHeader={CustomHeader}
                            calendarClassName="border-none font-sans"
                            dayClassName={(date) => {
                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                if (isPast) return "past-day";
                                return "day-cell";
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
                <div className="flex items-center gap-2">
                    {/* Presets removed per user request */}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClear}
                        className="px-5 py-2 rounded-lg border border-[#D1D9D9] text-[#111827] font-bold text-xs hover:bg-[#F4F6F5] transition-colors"
                    >
                        Clear dates
                    </button>
                    <button
                        onClick={handleApply}
                        className="bg-[#0f4c3a] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1f2b22] transition-all shadow-sm hover:shadow-md"
                    >
                        {listingCount !== null && listingCount !== undefined ? `Show ${listingCount} places` : 'Apply'}
                    </button>
                </div>
            </div>

            <style>{`
                .react-datepicker {
                    border: none !important;
                    font-family: inherit !important;
                    display: flex !important;
                }
                .react-datepicker__month-container {
                    padding: 0 0.5rem !important;
                }
                .react-datepicker__header {
                    background: white !important;
                    border-bottom: none !important;
                    padding-top: 0 !important;
                    margin-bottom: -10px !important;
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
                .react-datepicker__day--disabled,
                .past-day {
                    color: #9ca3af !important;
                    background-color: transparent !important;
                    opacity: 0.2 !important;
                    cursor: not-allowed !important;
                    pointer-events: none !important;
                }
                
                .react-datepicker__day--selected,
                .selected-day {
                    background-color: #0f4c3a !important;
                    color: white !important;
                    border-radius: 50% !important;
                    opacity: 1 !important;
                    z-index: 20 !important;
                }
                
                .react-datepicker__day--keyboard-selected {
                     background-color: transparent !important;
                     color: inherit !important;
                }
                .react-datepicker__day--outside-month {
                    visibility: hidden !important;
                    pointer-events: none !important;
                }
                 /* Hide scrollbar for webkit */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );

    return isAbsolute ? content : ReactDOM.createPortal(content, document.body);
};

export default DateFilter;
