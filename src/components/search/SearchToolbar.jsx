import React from 'react';
import { Map, ArrowUpDown, GripHorizontal } from 'lucide-react';

const SearchToolbar = ({ showMap, onToggleMap }) => {
    return (
        <div className="flex items-center justify-between mb-6">
            {/* LEFT: SORT / FILTER STATUS (Optional, keeping simple for now) */}
            <div className="hidden md:flex gap-2">
                {/* Could add sorting dropdown here if needed */}
            </div>

            {/* RIGHT: MAP TOGGLE & VIEW */}
            <div className="flex items-center gap-3 ml-auto">

                <button className="flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg border border-gray-200 bg-white text-base sm:text-sm font-medium hover:border-gray-300 transition-colors">
                    <ArrowUpDown size={16} className="sm:w-3.5 sm:h-3.5" />
                    Recommended
                </button>

                <button
                    onClick={onToggleMap}
                    className={`
            flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg border text-base sm:text-sm font-medium transition-all
            ${showMap
                            ? 'bg-[#0f4c3a] text-white border-[#0f4c3a]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }
          `}
                >
                    <Map size={14} />
                    Map
                </button>
            </div>
        </div>
    );
};

export default SearchToolbar;
