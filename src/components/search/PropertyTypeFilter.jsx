import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Check } from 'lucide-react';

const PropertyTypeFilter = ({ filters, setFilters, onClose, position }) => {
    const propertyTypes = filters.propertyTypes || [];

    useEffect(() => {
        // Body scroll lock on mount
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const toggleType = (type) => {
        setFilters(prev => {
            const current = prev.propertyTypes || [];
            const next = current.includes(type)
                ? current.filter(t => t !== type)
                : [...current, type];
            return { ...prev, propertyTypes: next };
        });
    };

    const handleClear = () => {
        setFilters(prev => ({ ...prev, propertyTypes: [] }));
    };

    const options = [
        { id: 'Shared room', label: 'Shared room' },
        { id: 'Private room', label: 'Private room' },
        { id: 'Studio', label: 'Studio' },
        { id: 'Apartment', label: 'Apartment' },
        { id: 'Student residence', label: 'Student residence' },
    ];

    return ReactDOM.createPortal(
        <div
            className="fixed bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-[9999] animate-in fade-in zoom-in-95 duration-200 w-[280px] pointer-events-auto"
            style={{ top: position?.top || 0, left: position?.left || 0 }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col gap-4">
                {options.map((opt) => (
                    <label
                        key={opt.id}
                        className={`flex items-center gap-3 cursor-pointer group select-none ${opt.indent ? 'ml-8' : ''}`}
                    >
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={propertyTypes.includes(opt.id)}
                                onChange={() => toggleType(opt.id)}
                                className="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-[#0f4c3a] checked:bg-[#0f4c3a] hover:border-[#0f4c3a]"
                            />
                            <Check
                                size={14}
                                className="absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none"
                                strokeWidth={3}
                            />
                        </div>
                        <span className={`text-sm font-medium transition-colors ${propertyTypes.includes(opt.id) ? 'text-[#111827]' : 'text-slate-600'}`}>
                            {opt.label}
                        </span>
                    </label>
                ))}
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

export default PropertyTypeFilter;
