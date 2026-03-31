import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SortDropdown from './SortDropdown';

const SearchHeader = ({ city, count, searchTerm, sortBy, setSortBy }) => {
    const displayCity = city === "All" ? (searchTerm || "Germany") : city;

    return (
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
                {/* BREADCRUMBS */}
                <div className="flex items-center gap-2 text-xs sm:text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-3">
                    <Link to="/" className="hover:underline">Home</Link>
                    <span className="text-[#9ca3af]">/</span>
                    {city && city !== "All" ? (
                        <>
                            <Link to="/cities" className="text-[#6b7280] hover:underline">cities</Link>
                            <span className="text-[#9ca3af]">/</span>
                            <span className="text-[#6b7280]">{city}</span>
                        </>
                    ) : (
                        <span className="text-[#6b7280]">Germany</span>
                    )}
                </div>

                {/* TITLE */}
                <h1 className="text-xl md:text-xl font-serif text-[#111827] leading-snug" style={{ fontVariantNumeric: 'lining-nums' }}>
                    <span className="font-bold">{count} rooms, studios and apartments</span> for rent in <span className="italic text-[#D4A017]">{displayCity}</span>
                </h1>
            </div>

            {/* Sort moved to toggle row */}
        </div>
    );
};

export default SearchHeader;
