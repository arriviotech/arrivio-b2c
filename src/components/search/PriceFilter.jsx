import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Euro } from 'lucide-react';

const PriceFilter = ({ filters, setFilters, onClose, position }) => {
    const [minPrice, setMinPrice] = useState(filters.priceMin || 0);
    const [maxPrice, setMaxPrice] = useState(filters.priceMax || 2000);
    const [billsIncluded, setBillsIncluded] = useState(false);

    const isInternalChange = React.useRef(false);

    useEffect(() => {
        // Body scroll lock on mount
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // Live sync to filters
    useEffect(() => {
        if (!isInternalChange.current) {
            isInternalChange.current = true;
            setFilters(prev => ({
                ...prev,
                priceMin: minPrice,
                priceMax: maxPrice
            }));
            setTimeout(() => {
                isInternalChange.current = false;
            }, 50);
        }
    }, [minPrice, maxPrice, setFilters]);

    // Sync from props
    useEffect(() => {
        if (isInternalChange.current) return;
        setMinPrice(filters.priceMin || 0);
        setMaxPrice(filters.priceMax || 2000);
    }, [filters.priceMin, filters.priceMax]);

    const handleMinChange = (e) => {
        const value = Math.min(Number(e.target.value), maxPrice - 100);
        setMinPrice(value);
    };

    const handleMaxChange = (e) => {
        const value = Math.max(Number(e.target.value), minPrice + 100);
        setMaxPrice(value);
    };

    const handleApply = () => {
        setFilters(prev => ({
            ...prev,
            priceMin: minPrice,
            priceMax: maxPrice
        }));
        onClose();
    };

    const handleClear = () => {
        setMinPrice(0);
        setMaxPrice(maxLimit);
        setBillsIncluded(false);
    };

    const histogramData = [
        10, 25, 40, 30, 60, 80, 50, 90, 100, 70, 40, 20, 50, 30, 80, 40, 20, 60, 40, 10,
        5, 20, 40, 30, 60, 40, 20, 10, 5, 10
    ];

    const maxLimit = 2000;
    const getPercent = (value) => Math.round(((value) / maxLimit) * 100);

    return ReactDOM.createPortal(
        <div
            className="fixed w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-[9999] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
            style={{ top: position?.top || 0, left: position?.left || 0 }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Currency Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#111827] font-bold text-lg">Price range</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500">
                    Euros (€)
                </div>
            </div>

            {/* Histogram */}
            <div className="h-16 flex items-end gap-[2px] mb-2 px-2">
                {histogramData.map((height, i) => {
                    // Determine if bar is within selected range
                    // map index i (0-29) to price range roughly
                    const barPrice = (i / histogramData.length) * maxLimit;
                    const isActive = barPrice >= minPrice && barPrice <= maxPrice;

                    return (
                        <div
                            key={i}
                            className={`flex-1 rounded-t-sm transition-colors duration-200 ${isActive ? 'bg-[#0f4c3a]' : 'bg-gray-200'}`}
                            style={{ height: `${height}%` }}
                        />
                    );
                })}
            </div>

            {/* Range Slider */}
            <div className="relative h-6 mb-8 select-none">
                {/* Track */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2"></div>

                {/* Active Range Track */}
                <div
                    className="absolute top-1/2 h-1 bg-[#0f4c3a] rounded-full -translate-y-1/2 z-10"
                    style={{
                        left: `${getPercent(minPrice)}%`,
                        width: `${getPercent(maxPrice) - getPercent(minPrice)}%`
                    }}
                ></div>

                {/* Left Thumb Input */}
                <input
                    type="range"
                    min={0}
                    max={maxLimit}
                    value={minPrice}
                    onChange={handleMinChange}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
                    style={{ pointerEvents: 'none' }} // Trick to allow click through, but handles need pointer-events auto
                />

                {/* Right Thumb Input - overlay */}
                <input
                    type="range"
                    min={0}
                    max={maxLimit}
                    value={maxPrice}
                    onChange={handleMaxChange}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
                    style={{ pointerEvents: 'none' }}
                />

                {/* Visual Thumbs (since default inputs are hard to style double) */}
                {/* Actually, styling pseudo elements for range is better. But let's use custom handles for full control if inputs are hidden */}
                <div
                    className="absolute top-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md -translate-y-1/2 -translate-x-1/2 flex items-center justify-center cursor-grab z-30 pointer-events-none"
                    style={{ left: `${getPercent(minPrice)}%` }}
                >
                    <div className="w-2 h-[10px] border-l border-r border-gray-300"></div>
                </div>
                <div
                    className="absolute top-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md -translate-y-1/2 -translate-x-1/2 flex items-center justify-center cursor-grab z-30 pointer-events-none"
                    style={{ left: `${getPercent(maxPrice)}%` }}
                >
                    <div className="w-2 h-[10px] border-l border-r border-gray-300"></div>
                </div>

                <style>{`
                    input[type=range]::-webkit-slider-thumb {
                        pointer-events: auto;
                        width: 24px;
                        height: 24px;
                        -webkit-appearance: none;
                        cursor: pointer;
                        background: transparent;
                    }
                `}</style>
            </div>


            {/* Inputs Row */}
            <div className="flex gap-4 mb-6">
                <div className="border border-gray-300 rounded-lg px-3 py-2 w-full focus-within:ring-1 focus-within:ring-[#0f4c3a] focus-within:border-[#0f4c3a]">
                    <div className="text-xs text-gray-500 mb-0.5">Minimum</div>
                    <div className="flex items-center">
                        <span className="text-gray-400 mr-1">€</span>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(Number(e.target.value))}
                            className="w-full text-[#111827] outline-none font-medium"
                        />
                    </div>
                </div>
                <div className="border border-gray-300 rounded-lg px-3 py-2 w-full focus-within:ring-1 focus-within:ring-[#0f4c3a] focus-within:border-[#0f4c3a]">
                    <div className="text-xs text-gray-500 mb-0.5">Maximum</div>
                    <div className="flex items-center">
                        <span className="text-gray-400 mr-1">€</span>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full text-[#111827] outline-none font-medium"
                        />
                    </div>
                </div>
            </div>



            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                    onClick={handleClear}
                    className="text-[#111827] font-medium text-sm hover:underline"
                >
                    Clear
                </button>
                <button
                    onClick={handleApply}
                    className="bg-[#0f4c3a] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1f2b22] transition-all shadow-sm hover:shadow-md"
                >
                    Show results
                </button>
            </div>
        </div>,
        document.body
    );
};

export default PriceFilter;
