import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Check } from 'lucide-react';

const FacilitiesFilter = ({ filters, setFilters, onClose, position }) => {
    const selectedTags = filters.tags || [];

    useEffect(() => {
        // Body scroll lock on mount
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const toggleTag = (tag) => {
        setFilters(prev => {
            const current = prev.tags || [];
            const next = current.includes(tag)
                ? current.filter(t => t !== tag)
                : [...current, tag];
            return { ...prev, tags: next };
        });
    };

    const handleClear = () => {
        setFilters(prev => ({ ...prev, tags: [] }));
    };

    const facilities = [
        'Private bathroom',
        'Balcony/terrace',
        'Garden',
        'Kitchen',
        'Pets allowed',
        'Parking',
        'Wheelchair accessible',
        'Basement'
    ];

    const amenities = [
        'Dishwasher',
        'Washing machine',
        'Dryer',
        'Air conditioning',
        'Heating',
        'TV',
        'Desk or Workspace'
    ];

    return ReactDOM.createPortal(
        <div
            className="fixed bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-[9999] animate-in fade-in zoom-in-95 duration-200 w-[500px] pointer-events-auto"
            style={{ top: position?.top || 0, left: position?.left || 0 }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="grid grid-cols-2 gap-8">
                {/* FACILITIES COLUMN */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-[#111827] mb-2">Facilities</h3>
                    {facilities.map((item) => (
                        <label key={item} className="flex items-center gap-3 cursor-pointer group select-none">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(item)}
                                    onChange={() => toggleTag(item)}
                                    className="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-[#0f4c3a] checked:bg-[#0f4c3a] hover:border-[#0f4c3a]"
                                />
                                <Check
                                    size={14}
                                    className="absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none"
                                    strokeWidth={3}
                                />
                            </div>
                            <span className={`text-sm font-medium transition-colors ${selectedTags.includes(item) ? 'text-[#111827]' : 'text-slate-600'}`}>
                                {item}
                            </span>
                        </label>
                    ))}
                </div>

                {/* AMENITIES COLUMN */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-[#111827] mb-2">Amenities</h3>
                    {amenities.map((item) => (
                        <label key={item} className="flex items-center gap-3 cursor-pointer group select-none">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(item)}
                                    onChange={() => toggleTag(item)}
                                    className="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-[#0f4c3a] checked:bg-[#0f4c3a] hover:border-[#0f4c3a]"
                                />
                                <Check
                                    size={14}
                                    className="absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none"
                                    strokeWidth={3}
                                />
                            </div>
                            <span className={`text-sm font-medium transition-colors ${selectedTags.includes(item) ? 'text-[#111827]' : 'text-slate-600'}`}>
                                {item}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-start">
                <button
                    onClick={handleClear}
                    className="px-6 py-2 rounded-lg border border-slate-200 text-[#111827] font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                    Clear
                </button>
            </div>
        </div>,
        document.body
    );
};

export default FacilitiesFilter;
