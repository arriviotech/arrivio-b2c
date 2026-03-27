import React from 'react';
import Skeleton from '../common/Skeleton';

/**
 * Full Property Details page loading skeleton.
 */
const PropertyDetailsSkeleton = () => (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
        <div className="pt-24 px-4 md:px-12 max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-4" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-4" />
                <Skeleton className="h-3 w-20" />
            </div>

            {/* Gallery */}
            <div className="mb-5 grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
                <Skeleton className="col-span-2 row-span-2 h-72 md:h-96 rounded-none" />
                <Skeleton className="h-36 md:h-[190px] rounded-none" />
                <Skeleton className="h-36 md:h-[190px] rounded-none" />
                <Skeleton className="h-36 md:h-[190px] rounded-none hidden md:block" />
                <Skeleton className="h-36 md:h-[190px] rounded-none hidden md:block" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Title */}
                    <div>
                        <Skeleton className="h-10 w-3/4 mb-4" />
                        <div className="flex gap-3">
                            <Skeleton className="h-7 w-28 rounded-full" />
                            <Skeleton className="h-7 w-16 rounded-full" />
                            <Skeleton className="h-7 w-36 rounded-full" />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4">
                        <Skeleton className="h-16 w-24 rounded-xl" />
                        <Skeleton className="h-16 w-24 rounded-xl" />
                        <Skeleton className="h-16 w-24 rounded-xl" />
                        <Skeleton className="h-16 w-24 rounded-xl" />
                    </div>

                    {/* Description */}
                    <div className="pt-6 border-t border-[#0f4c3a]/10 space-y-3">
                        <Skeleton className="h-7 w-48 mb-4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Amenities */}
                    <div className="pt-6 border-t border-[#0f4c3a]/10 space-y-4">
                        <Skeleton className="h-7 w-32 mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — Booking Widget */}
                <div className="lg:col-span-5">
                    <div className="bg-white/50 border border-white/60 rounded-2xl p-6 space-y-4">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-px w-full" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default PropertyDetailsSkeleton;


