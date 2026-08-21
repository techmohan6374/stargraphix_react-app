import React from 'react';

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm p-4">
          <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl mb-4" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-16 h-4 bg-gray-200 rounded-full" />
            <div className="w-12 h-4 bg-gray-200 rounded-full" />
          </div>
          <div className="w-3/4 h-5 bg-gray-200 rounded-lg mb-2" />
          <div className="w-full h-3 bg-gray-200 rounded-lg mb-1" />
          <div className="w-5/6 h-3 bg-gray-200 rounded-lg mb-4" />
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="w-20 h-6 bg-gray-200 rounded-lg" />
            <div className="w-24 h-9 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded-md flex-1" />
        ))}
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-16 flex items-center px-4 gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-gray-200 rounded-md flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200" />
            <div className="w-12 h-4 bg-gray-200 rounded-full" />
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded-lg mb-2" />
          <div className="w-16 h-3 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
