import React from 'react';
import Skeleton from '../common/Skeleton';

const DashboardSkeleton = () => (
  <div className="space-y-5">
    {/* Welcome */}
    <div>
      <Skeleton className="h-7 w-56 mb-2" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Active Booking Card */}
    <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
      <div className="flex">
        <div className="w-1.5 bg-[#e5e7eb] shrink-0" />
        <div className="flex-1 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-40" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-4" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-20 ml-auto" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </div>

    {/* Upcoming Payment */}
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div>
          <Skeleton className="h-4 w-20 mb-1.5" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-6 w-16 mb-1" />
        <Skeleton className="h-3 w-14 ml-auto" />
      </div>
    </div>

    {/* Popular Services */}
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-3 border border-[#e5e7eb]">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-full mb-1.5" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>

    {/* Recent Orders */}
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-3 w-28 mb-1.5" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <div className="text-right">
              <Skeleton className="h-3 w-14 mb-1" />
              <Skeleton className="h-3 w-8 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recent Payments */}
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="w-1 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3 w-32 mb-1.5" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div>
      <Skeleton className="h-3 w-24 mb-2 ml-1" />
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl px-3 py-3 border border-[#e5e7eb] text-center">
            <Skeleton className="h-8 w-8 rounded-lg mx-auto mb-1.5" />
            <Skeleton className="h-2.5 w-12 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
