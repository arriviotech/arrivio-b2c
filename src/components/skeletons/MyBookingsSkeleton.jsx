import React from 'react';
import Skeleton from '../common/Skeleton';

const BookingCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
    <div className="p-4 space-y-3">
      {/* Title + Status */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-44" />
        </div>
        <div className="text-right shrink-0 ml-3">
          <Skeleton className="h-5 w-12 mb-1" />
          <Skeleton className="h-2.5 w-10 ml-auto" />
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  </div>
);

const ApplicationCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-36 mb-1" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Step progress bar */}
      <div>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-1.5 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center" style={{ width: '20%' }}>
              <Skeleton className="w-6 h-6 rounded-full mb-1" />
              <Skeleton className="h-2 w-10" />
            </div>
          ))}
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      {/* Dates */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* CTA */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

const MyBookingsSkeleton = () => (
  <div>
    <Skeleton className="h-6 w-32 mb-6" />

    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>

      {/* Active Bookings */}
      <div>
        <Skeleton className="h-2.5 w-28 mb-3 ml-1" />
        <div className="space-y-3">
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      </div>

      {/* Applications */}
      <div>
        <Skeleton className="h-2.5 w-36 mb-3 ml-1" />
        <div className="space-y-3">
          <ApplicationCardSkeleton />
        </div>
      </div>
    </div>
  </div>
);

export default MyBookingsSkeleton;
