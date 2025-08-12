// client/src/components/UI/Table/VirtualTable.jsx
import React, { useRef, useState, useCallback, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const VirtualTable = memo(({ 
  data = [], 
  columns = [], 
  height = 600,
  rowHeight = 50,
  onRowClick,
  highlightChanges = {},
  loading = false
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const parentRef = useRef();

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [data, sortConfig]);

  // Handle sort
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Row renderer
  const Row = ({ index, style }) => {
    const row = sortedData[index];
    const hasChanges = highlightChanges[row.ItemCode];

    return (
      <div 
        style={style} 
        className={`
          flex items-center border-b hover:bg-gray-50 transition-colors cursor-pointer
          ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
          ${hasChanges ? 'bg-yellow-50' : ''}
        `}
        onClick={() => onRowClick?.(row)}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-2 text-sm text-gray-900 truncate"
            style={{ 
              width: column.width || 'auto',
              minWidth: column.width || 100
            }}
          >
            {column.render ? column.render(row[column.key], row) : row[column.key]}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <TableSkeleton columns={columns.length} rows={10} />;
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex bg-gray-100 border-b sticky top-0 z-10">
        {columns.map((column) => (
          <div
            key={column.key}
            className={`
              px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider
              ${column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}
            `}
            style={{ width: column.width || 'auto', minWidth: column.width || 100 }}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className="flex items-center justify-between">
              {column.label}
              {column.sortable && sortConfig.key === column.key && (
                <span className="ml-2">
                  {sortConfig.direction === 'asc' ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Body with virtual scrolling */}
      <div ref={parentRef} style={{ height }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={sortedData.length}
              itemSize={rowHeight}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
});

// Table Skeleton
const TableSkeleton = ({ columns = 5, rows = 10 }) => {
  return (
    <div className="bg-white rounded-lg">
      <div className="border-b bg-gray-50 p-4">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
          ))}
        </div>
      </div>
      <div className="p-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4 mb-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-8 bg-gray-100 rounded animate-pulse flex-1"
                style={{ animationDelay: `${(rowIndex + colIndex) * 100}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualTable;