import React from 'react';
import Skeleton from '../common/Skeleton';

const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 space-y-3">
    <div className="flex items-start gap-3">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1.5" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <Skeleton className="h-5 w-12" />
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-3/4" />
    <Skeleton className="h-10 w-full rounded-xl" />
  </div>
);

const ServicesSkeleton = () => (
  <div>
    <Skeleton className="h-6 w-20 mb-1" />
    <Skeleton className="h-3 w-64 mb-5" />

    {/* Main Tabs */}
    <div className="flex gap-2 mb-5">
      <Skeleton className="h-10 w-32 rounded-xl" />
      <Skeleton className="h-10 w-24 rounded-xl" />
    </div>

    {/* Category Tabs */}
    <div className="flex gap-2 overflow-x-auto mb-5">
      {['w-14', 'w-24', 'w-20', 'w-16', 'w-24', 'w-20'].map((w, i) => (
        <Skeleton key={i} className={`h-9 ${w} rounded-full shrink-0`} />
      ))}
    </div>

    {/* Service Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-between mt-5">
      <Skeleton className="h-3 w-32" />
      <div className="flex items-center gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-8 h-8 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default ServicesSkeleton;
