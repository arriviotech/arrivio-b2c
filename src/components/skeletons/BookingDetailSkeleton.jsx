import React from 'react';
import Skeleton from '../common/Skeleton';

const BookingDetailSkeleton = () => (
  <div className="space-y-5">
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-7 w-28 rounded-full" />
    </div>

    {/* Property Card with Image */}
    <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>

    {/* Lease Period */}
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
      <Skeleton className="h-3 w-24 mb-4" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-2.5 w-16 mb-1.5" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-px w-6" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-px w-6" />
        </div>
        <div className="text-right">
          <Skeleton className="h-2.5 w-16 mb-1.5 ml-auto" />
          <Skeleton className="h-4 w-36 ml-auto" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>

    {/* Monthly Rent Schedule */}
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Timeline */}
      <div className="ml-1 space-y-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center shrink-0 w-5">
              <Skeleton className="h-[18px] w-[18px] rounded-full shrink-0" />
              {i < 3 && <Skeleton className="w-0.5 min-h-[36px] flex-1 rounded-none" />}
            </div>
            <div className="flex-1 flex items-center justify-between pb-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        ))}
      </div>

      {/* Cost Summary */}
      <div className="mt-4 pt-4 border-t border-[#e5e7eb] space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#e5e7eb]">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>

    {/* Payment History */}
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#f7f7f7]">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-1.5 h-8 rounded-full" />
              <div>
                <Skeleton className="h-3 w-28 mb-1.5" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-xl mt-4" />
    </div>

    {/* Rental Agreement */}
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
      <Skeleton className="h-3 w-28 mb-4" />
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>

    {/* Actions */}
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
);

export default BookingDetailSkeleton;
