// my-apps/client/src/Components/UI/Table/VirtualTable.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './VirtualTable.css';

const VirtualTable = ({
  data = [],
  columns = [],
  height = 400,
  rowHeight = 50,
  headerHeight = 40,
  onRowClick,
  onSort,
  sortBy,
  sortOrder,
  highlightChanges = {},
  loading = false,
  className = '',
  showHeader = true,
  stickyHeader = true
}) => {
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate how many rows can be visible
  const visibleRowCount = Math.ceil((height - headerHeight) / rowHeight);

  // Calculate visible rows based on scroll position
  useEffect(() => {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(startIndex + visibleRowCount + 1, data.length);
    setVisibleStartIndex(startIndex);
    setVisibleEndIndex(endIndex);
  }, [scrollTop, rowHeight, visibleRowCount, data.length]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Handle sort click
  const handleSort = useCallback((columnKey) => {
    if (onSort) {
      onSort(columnKey);
    }
  }, [onSort]);

  // Calculate total height
  const totalHeight = data.length * rowHeight;

  // Get visible rows
  const visibleRows = useMemo(() => {
    return data.slice(visibleStartIndex, visibleEndIndex);
  }, [data, visibleStartIndex, visibleEndIndex]);

  // Header component
  const TableHeader = () => (
    <div 
      className={`virtual-table-header ${stickyHeader ? 'sticky' : ''}`}
      style={{ height: headerHeight }}
    >
      {columns.map((column) => (
        <div
          key={column.key}
          className={`header-cell ${column.sortable ? 'sortable' : ''} ${column.align || 'left'}`}
          style={{ 
            width: column.width || 120,
            minWidth: column.width || 120
          }}
          onClick={() => column.sortable && handleSort(column.key)}
        >
          <span className="header-text">{column.title}</span>
          {column.sortable && sortBy === column.key && (
            <span className="sort-indicator">
              {sortOrder === 'ASC' ? '↑' : '↓'}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  // Row component
  const VirtualRow = ({ item, index, style }) => {
    const actualIndex = visibleStartIndex + index;
    const isEven = actualIndex % 2 === 0;
    
    return (
      <div
        style={{
          ...style,
          top: visibleStartIndex * rowHeight + (style?.top || 0)
        }}
        className={`virtual-table-row ${isEven ? 'even' : 'odd'}`}
        onClick={() => onRowClick && onRowClick(item)}
      >
        {columns.map((column) => {
          const value = item[column.key];
          const cellKey = `${item[columns[0]?.key] || actualIndex}_${column.key}`;
          const hasChanges = highlightChanges[cellKey];

          return (
            <div
              key={column.key}
              className={`table-cell ${column.align || 'left'} ${hasChanges ? 'has-changes' : ''}`}
              style={{ 
                width: column.width || 120,
                minWidth: column.width || 120
              }}
            >
              {column.render ? 
                column.render(value, item, actualIndex) : 
                (value !== null && value !== undefined ? String(value) : '')
              }
            </div>
          );
        })}
      </div>
    );
  };

  // Loading overlay
  const LoadingOverlay = () => (
    <div className="virtual-table-loading">
      <div className="loading-content">
        <div className="spinner"></div>
        <span>กำลังโหลด...</span>
      </div>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="virtual-table-empty">
      <div className="empty-content">
        <div className="empty-icon">📋</div>
        <p>ไม่พบข้อมูล</p>
        <small>ลองเปลี่ยนเงื่อนไขการค้นหา</small>
      </div>
    </div>
  );

  return (
    <div className={`virtual-table-container ${className}`}>
      <div 
        className="virtual-table"
        style={{ height }}
      >
        {/* Header */}
        {showHeader && <TableHeader />}
        
        {/* Table Body */}
        <div 
          className="virtual-table-body"
          style={{ 
            height: showHeader ? height - headerHeight : height,
            overflowY: 'auto'
          }}
          onScroll={handleScroll}
        >
          {loading ? (
            <LoadingOverlay />
          ) : data.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ height: totalHeight, position: 'relative' }}>
              {visibleRows.map((item, index) => (
                <VirtualRow
                  key={visibleStartIndex + index}
                  item={item}
                  index={index}
                  style={{
                    position: 'absolute',
                    top: (visibleStartIndex + index) * rowHeight,
                    left: 0,
                    right: 0,
                    height: rowHeight
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTable;