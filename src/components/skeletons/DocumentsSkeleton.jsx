import React from 'react';
import Skeleton from '../common/Skeleton';

const DocumentsSkeleton = () => (
  <div>
    <Skeleton className="h-6 w-32 mb-1" />
    <Skeleton className="h-3 w-64 mb-6" />

    {/* Application Group */}
    <div className="space-y-6">
      <div>
        {/* Group Header */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-48" />
        </div>

        {/* Document Rows */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <Skeleton className="h-2.5 w-48" />
              </div>
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Expected Documents Guide */}
    <div className="mt-6">
      <Skeleton className="h-3 w-40 mb-2 ml-1" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-[#e5e7eb]">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DocumentsSkeleton;
