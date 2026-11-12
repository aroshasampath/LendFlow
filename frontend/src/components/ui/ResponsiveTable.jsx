import React from 'react';

/**
 * ResponsiveTable Component
 * - Mobile (<768px): Stacks data into clean, touch-friendly cards.
 * - Tablet/Desktop (>=768px): Displays standard clean tabular format.
 */
export const ResponsiveTable = ({
  columns,
  data,
  keyExtractor = (item, index) => item.id || item._id || index,
  emptyMessage = 'No records found.',
  className = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* 1. Mobile Card View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {data.map((item, rowIndex) => (
          <div
            key={keyExtractor(item, rowIndex)}
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5"
          >
            {columns.map((col, colIndex) => (
              <div
                key={col.key || colIndex}
                className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-slate-100 last:border-b-0"
              >
                <span className="font-semibold text-slate-500">{col.header}:</span>
                <span className="text-slate-900 font-medium text-right">
                  {col.render ? col.render(item, rowIndex) : item[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 2. Desktop Tabular View (>= 768px) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="table-container-responsive">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                {columns.map((col, idx) => (
                  <th key={col.key || idx} scope="col" className="px-5 py-3.5 whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {data.map((item, rowIndex) => (
                <tr key={keyExtractor(item, rowIndex)} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={col.key || colIndex} className="px-5 py-3.5 whitespace-nowrap text-sm">
                      {col.render ? col.render(item, rowIndex) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

