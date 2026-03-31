import React from 'react';
import Skeleton from '../common/Skeleton';

const MyPaymentsSkeleton = () => (
  <div>
    <Skeleton className="h-6 w-36 mb-4" />

    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {['w-16', 'w-12', 'w-14'].map((width, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className={`h-6 ${width}`} />
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>

      {/* Month Header */}
      <div>
        <Skeleton className="h-3 w-28 mb-2 ml-1" />

        {/* Payment Rows */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="w-1 h-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-2.5 w-36" />
              </div>
              <div className="text-right shrink-0">
                <Skeleton className="h-4 w-14 mb-1" />
                <Skeleton className="h-2.5 w-8 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-3 w-36" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-8 h-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MyPaymentsSkeleton;
