import React from 'react';
import Skeleton from '../common/Skeleton';

/**
 * Skeleton for a single property card on the Search page.
 */
const PropertyCardSkeleton = () => (
    <div className="bg-white rounded-[16px] overflow-hidden border border-[#f2f2f2] flex flex-col h-full animate-pulse">
        {/* Image Placeholder */}
        <div className="relative bg-gray-200" style={{ aspectRatio: '3/2' }}>
            <Skeleton className="w-full h-full rounded-none" />
        </div>

        {/* Content Placeholder */}
        <div className="p-4 space-y-4 flex flex-col flex-grow">
            {/* Title & Rating Row */}
            <div className="flex justify-between items-start gap-4">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-5 w-12 rounded-md shrink-0" />
            </div>

            {/* Specs Row */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-12 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
            </div>

            {/* Price Row */}
            <div className="mt-auto pb-3">
                <Skeleton className="h-6 w-32 rounded-md" />
            </div>

            {/* Footer */}
            <div className="border-t border-[#f2f2f2] pt-3">
                <Skeleton className="h-4 w-24 rounded-md" />
            </div>
        </div>
    </div>
);

/**
 * Full Search page loading skeleton.
 */
const SearchSkeleton = () => (
    <div className="min-h-screen w-full bg-[#f2f2f2] pt-16 md:pt-20 flex flex-col relative overflow-hidden">
        {/* 1. STICKY FILTER BAR PLACEHOLDER (Exact Match to SearchFiltersBar frame) */}
        <div className="sticky top-0 z-30 bg-[#f2f2f2] px-4 md:px-8 py-3 border-b border-[#0f4c3a]/5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden flex-grow">
                    <Skeleton className="h-9 w-40 rounded-full shrink-0" />
                    <Skeleton className="h-9 w-24 rounded-full shrink-0" />
                    <Skeleton className="h-9 w-32 rounded-full shrink-0" />
                    <Skeleton className="h-9 w-28 rounded-full shrink-0" />
                    <Skeleton className="h-9 w-36 rounded-full shrink-0" />
                </div>
                <div className="hidden md:block">
                    <Skeleton className="h-9 w-32 rounded-full" />
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 w-full flex flex-col lg:flex-row gap-10 relative">
            {/* LEFT PANEL (LIST) - 60% split restored to match frames */}
            <div className="lg:w-[60%] flex-1">
                {/* 2. TABS & SEARCH ROW */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#0f4c3a]/5 pb-1">
                    <div className="flex gap-6">
                        <Skeleton className="h-8 w-16 rounded-sm mb-[-2px]" />
                        <Skeleton className="h-8 w-16 rounded-sm mb-[-2px]" />
                        <Skeleton className="h-8 w-16 rounded-sm mb-[-2px]" />
                    </div>
                    <Skeleton className="h-10 w-full md:w-64 lg:w-72 rounded-full" />
                </div>

                {/* 3. HEADER (Breadcrumbs + Title) */}
                <div className="mb-8 space-y-3">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-10 w-80 rounded-md" />
                </div>

                {/* 4. CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <PropertyCardSkeleton key={i} />
                    ))}
                </div>
            </div>

            {/* MAP SIDEBAR FRAME RESTORED */}
            <div className="hidden lg:block lg:w-[40%] lg:sticky lg:top-36 lg:h-[calc(100vh-9rem)]">
                <div className="w-full h-full bg-white/40 border border-[#f2f2f2] rounded-2xl overflow-hidden relative shadow-sm">
                    <Skeleton className="w-full h-full rounded-none" />
                </div>
            </div>
        </div>
    </div>
);

export default SearchSkeleton;


