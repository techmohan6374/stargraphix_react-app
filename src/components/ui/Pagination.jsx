import React from 'react';
import Icon from '../icons/Icons';

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (!totalItems || totalItems <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100 bg-white px-5 py-3.5 mt-5 rounded-2xl shadow-xs">
      {/* Items count summary */}
      <div>
        <p className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
          <span className="font-bold text-primary-600">{totalItems}</span> items
        </p>
      </div>

      {/* Modern Rounded Radius Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200/90 hover:border-gray-300 rounded-full disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
          title="Previous Page"
        >
          <Icon name="ChevronLeft" size={14} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Pill Buttons */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`min-w-[32px] h-8 px-2.5 flex items-center justify-center text-xs font-black rounded-full transition-all duration-150 active:scale-95 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-red-600 to-primary-600 text-white shadow-md shadow-red-500/25 ring-2 ring-primary-500/30'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200/90 hover:border-gray-300 shadow-2xs'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200/90 hover:border-gray-300 rounded-full disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
          title="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <Icon name="ChevronRight" size={14} />
        </button>
      </div>
    </div>
  );
}
