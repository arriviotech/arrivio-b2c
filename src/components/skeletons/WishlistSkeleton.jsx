import React from 'react';
import Skeleton from '../common/Skeleton';

const RowSkeleton = () => (
  <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden flex">
    {/* Image */}
    <Skeleton className="w-36 md:w-44 shrink-0 rounded-none" />

    {/* Content */}
    <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
      <div>
        <Skeleton className="h-4 w-40 mb-1.5" />
        <Skeleton className="h-3 w-32 mb-2.5" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-5 w-24 mt-2" />
    </div>

    {/* Actions column */}
    <div className="shrink-0 w-10 flex flex-col items-center justify-between py-3">
      <Skeleton className="w-4 h-4 rounded" />
      <Skeleton className="w-3.5 h-3.5 rounded" />
    </div>
  </div>
);

const WishlistSkeleton = () => (
  <div className="max-w-7xl mx-auto">
    {/* Header */}
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 pt-2">
      <div>
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-9 w-36 rounded-full" />
    </header>

    {/* Tabs */}
    <div className="flex gap-2 mb-3">
      <Skeleton className="h-9 w-28 rounded-full" />
      <Skeleton className="h-9 w-20 rounded-full" />
    </div>

    {/* Rows */}
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default WishlistSkeleton;
