// Enhanced VirtualTable.js - สวยงามและทันสมัย
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import './VirtualTable.module.css';

const VirtualTable = ({
  data = [],
  columns = [],
  height = 480,
  rowHeight = 52, // เพิ่มขึ้นเล็กน้อยสำหรับความสวยงาม
  headerHeight = 56, // เพิ่มขึ้นสำหรับ header ที่สวยกว่า
  onRowClick,
  onSort,
  sortBy,
  sortOrder,
  highlightChanges = {},
  loading = false,
  className = '',
  showHeader = true,
  stickyHeader = true,
  emptyMessage = 'ไม่พบข้อมูล',
  rowClassName = '',
  hoverEffects = true,
  theme = 'modern', // 'modern', 'minimal', 'colorful'
}) => {
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // จำนวนแถวที่มองเห็น + buffer
  const visibleRowCount = Math.ceil((height - (showHeader ? headerHeight : 0)) / rowHeight) + 6;

  // คำนวณ index ที่ต้อง render
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 3);
  const endIndex = Math.min(data.length, startIndex + visibleRowCount);

  // Handle scroll with performance optimization
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    
    if (!isScrolling) {
      setIsScrolling(true);
    }

    // Clear existing timeout
    clearTimeout(scrollTimeoutRef.current);
    
    // Set new timeout to detect end of scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [isScrolling]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced mouse wheel handling
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const onWheel = (e) => {
      // Smooth scrolling for better UX
      if (Math.abs(e.deltaY) > 100) {
        e.preventDefault();
        el.scrollBy({
          top: e.deltaY > 0 ? rowHeight * 3 : -rowHeight * 3,
          behavior: 'smooth'
        });
      }
    };
    
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [rowHeight]);

  const visibleRows = useMemo(() => data.slice(startIndex, endIndex), [data, startIndex, endIndex]);

  // Theme configurations
  const themes = {
    modern: {
      headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      headerText: 'text-white',
      rowBg: {
        even: 'bg-white',
        odd: 'bg-slate-50/50',
        hover: 'hover:bg-blue-50/70'
      },
      border: 'border-slate-200/60',
      shadow: 'shadow-lg shadow-slate-900/10'
    },
    minimal: {
      headerBg: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
      headerText: 'text-gray-800',
      rowBg: {
        even: 'bg-white',
        odd: 'bg-gray-50/30',
        hover: 'hover:bg-gray-100/50'
      },
      border: 'border-gray-200',
      shadow: 'shadow-md shadow-gray-900/5'
    },
    colorful: {
      headerBg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
      headerText: 'text-white',
      rowBg: {
        even: 'bg-white',
        odd: 'bg-gradient-to-r from-blue-50/30 to-purple-50/30',
        hover: 'hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-blue-50/50'
      },
      border: 'border-purple-200/40',
      shadow: 'shadow-xl shadow-purple-900/20'
    }
  };

  const currentTheme = themes[theme] || themes.modern;

  // Enhanced Header Component
  const Header = useMemo(() => {
    return () => (
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`vt-header ${stickyHeader && showHeader ? 'sticky' : ''}`}
        style={{
          height: headerHeight,
          minHeight: headerHeight,
          display: showHeader ? 'flex' : 'none',
          position: stickyHeader ? 'sticky' : 'static',
          top: 0,
          zIndex: 20,
          background: currentTheme.headerBg,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {columns.map((col, index) => {
          const active = col.sortable && sortBy === col.key;
          
          return (
            <motion.div
              key={col.key}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`vt-cell vt-header-cell ${col.align || 'left'} ${col.sortable ? 'sortable' : ''} ${currentTheme.headerText}`}
              style={{
                width: col.width,
                minWidth: col.width,
                maxWidth: col.width,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: col.sortable ? 'pointer' : 'default',
                padding: '0 16px',
                userSelect: 'none',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                letterSpacing: '0.025em',
              }}
              onClick={() => col.sortable && onSort?.(col.key)}
              onMouseEnter={(e) => {
                if (col.sortable) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (col.sortable) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title={col.title}
            >
              <div className="flex items-center gap-2">
                {col.icon && (
                  <div className="w-4 h-4 opacity-80">
                    {col.icon}
                  </div>
                )}
                <span className="truncate font-medium">{col.title}</span>
              </div>
              
              {col.sortable && (
                <div className="flex flex-col items-center ml-auto">
                  {active ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white"
                    >
                      {sortOrder === 'ASC' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </motion.div>
                  ) : (
                    <ArrowsUpDownIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    );
  }, [columns, headerHeight, stickyHeader, showHeader, onSort, sortBy, sortOrder, currentTheme]);

  // Enhanced Row Component
  const renderRow = useCallback((row, rowIndex, absoluteIndex) => {
    const isOdd = absoluteIndex % 2 === 1;
    const isHovered = hoveredRow === absoluteIndex;
    const hasChanges = Object.keys(highlightChanges).some(key => 
      key.includes(row.ItemCode || row.id || absoluteIndex)
    );

    return (
      <motion.div
        key={row.id ?? row.key ?? row.ItemCode ?? absoluteIndex}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: rowIndex * 0.02, duration: 0.3 }}
        className={`vt-row group ${currentTheme.rowBg[isOdd ? 'odd' : 'even']} ${
          hoverEffects ? currentTheme.rowBg.hover : ''
        } ${hasChanges ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : ''} ${
          typeof rowClassName === 'function' ? rowClassName(row) : rowClassName
        }`}
        style={{
          display: 'flex',
          height: rowHeight,
          minHeight: rowHeight,
          borderBottom: `1px solid ${isOdd ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.1)'}`,
          alignItems: 'center',
          cursor: onRowClick ? 'pointer' : 'default',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered && hoverEffects ? 'translateX(4px)' : 'translateX(0)',
          boxShadow: isHovered && hoverEffects ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
        }}
        onClick={() => onRowClick?.(row)}
        onMouseEnter={() => setHoveredRow(absoluteIndex)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        {columns.map((col, colIndex) => {
          const value = row[col.key];
          const cellHasChanges = !!(
            highlightChanges?.[`${row.ItemCode || row.id || row.key}_${col.key}`] ||
            highlightChanges?.[`${row.ItemCode || row.id || row.key}_${col.key.toLowerCase()}`]
          );

          return (
            <motion.div
              key={col.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (rowIndex * 0.02) + (colIndex * 0.01) }}
              className={`vt-cell ${col.align || 'left'} ${cellHasChanges ? 'changed' : ''}`}
              style={{
                width: col.width,
                minWidth: col.width,
                maxWidth: col.width,
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: col.align === 'right' ? 'flex-end' : 
                              col.align === 'center' ? 'center' : 'flex-start',
                background: cellHasChanges ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))' : 'transparent',
                borderRadius: cellHasChanges ? '6px' : '0',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
              title={typeof value === 'string' ? value : undefined}
            >
              {/* Change indicator */}
              {cellHasChanges && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"
                  style={{ boxShadow: '0 0 4px rgba(245, 158, 11, 0.5)' }}
                />
              )}
              
              {col.render ? (
                <div className="w-full">
                  {col.render(value, row, absoluteIndex)}
                </div>
              ) : (
                <span className="truncate w-full">{value ?? '-'}</span>
              )}
            </motion.div>
          );
        })}

        {/* Row hover indicator */}
        {isHovered && hoverEffects && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-r"
          />
        )}
      </motion.div>
    );
  }, [columns, rowHeight, onRowClick, highlightChanges, hoveredRow, hoverEffects, rowClassName, currentTheme]);

  // Enhanced Empty State
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบข้อมูล</h3>
      <p className="text-gray-500 text-center max-w-sm">{emptyMessage}</p>
    </motion.div>
  );

  // Enhanced Loading State
  const LoadingState = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-blue-400" />
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <SparklesIcon className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">กำลังโหลดข้อมูล...</span>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div 
      className={`vt-wrap ${className} ${currentTheme.shadow}`} 
      style={{ 
        borderRadius: 20, 
        overflow: 'hidden', 
        position: 'relative',
        border: `1px solid rgba(148, 163, 184, 0.2)`,
        background: 'white'
      }}
    >
      {/* Enhanced Scroll Container */}
      <div
        ref={scrollRef}
        className={`vt-scroll ${isScrolling ? 'scrolling' : ''}`}
        style={{
          height,
          overflow: 'auto',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          scrollBehavior: 'smooth',
        }}
        onScroll={handleScroll}
      >
        {/* Sticky Header */}
        {showHeader && <Header />}

        {/* Main Content Container */}
        <div
          className="vt-rows-wrap"
          style={{
            position: 'relative',
            height: data.length * rowHeight,
            minHeight: data.length === 0 && !loading ? 200 : 'auto',
          }}
        >
          {/* Top Spacer */}
          <div style={{ height: startIndex * rowHeight }} />

          {/* Visible Rows */}
          <AnimatePresence mode="popLayout">
            {visibleRows.map((row, i) => {
              const absoluteIndex = startIndex + i;
              return renderRow(row, i, absoluteIndex);
            })}
          </AnimatePresence>

          {/* Bottom Spacer */}
          <div style={{ height: (data.length - endIndex) * rowHeight }} />

          {/* Empty State */}
          {!loading && data.length === 0 && <EmptyState />}
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && <LoadingState />}
      </AnimatePresence>

      {/* Scroll Indicator */}
      {data.length > visibleRowCount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolling ? 1 : 0.3 }}
          className="absolute right-2 top-20 bottom-20 w-1 bg-gray-200 rounded-full overflow-hidden"
        >
          <motion.div
            className="w-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"
            style={{
              height: `${(visibleRowCount / data.length) * 100}%`,
              transform: `translateY(${(startIndex / data.length) * 100}%)`,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          />
        </motion.div>
      )}
    </div>
  );
};

/* ============================================
 *  Enhanced ServerPagination with Modern Design
 * ============================================ */
export function ServerPagination({
  pagination = { page: 1, limit: 50, total: 0, totalPages: 1 },
  onPageChange,
  onLimitChange,
  loading = false,
  className = '',
  theme = 'modern'
}) {
  const { page = 1, limit = 50, total = 0, totalPages = 1 } = pagination || {};
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = total === 0 ? 0 : Math.min(page * limit, total);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const themes = {
    modern: 'bg-gradient-to-r from-slate-50 to-blue-50',
    minimal: 'bg-gray-50',
    colorful: 'bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50'
  };

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        w-full border-t border-slate-200/60 ${themes[theme]} px-6 py-4
        flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${className}
      `}
    >
      {/* Left: Info & Limit Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="text-sm text-gray-600 font-medium">
          แสดง <span className="text-blue-600 font-semibold">{start.toLocaleString()}</span> - 
          <span className="text-blue-600 font-semibold"> {end.toLocaleString()}</span> จาก 
          <span className="text-purple-600 font-semibold"> {total.toLocaleString()}</span> รายการ
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 font-medium">แสดงต่อหน้า:</label>
          <select
            value={limit}
            onChange={(e) => onLimitChange?.(Number(e.target.value))}
            disabled={loading}
            className="
              border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-white shadow-sm hover:border-gray-300 transition-colors
            "
          >
            {[20, 50, 100, 200].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation */}
      <div className="flex items-center justify-center lg:justify-end gap-2">
        {/* First & Previous */}
        <PaginationButton
          label="แรก"
          disabled={!canPrev || loading}
          onClick={() => onPageChange?.(1)}
          icon="first"
        />
        <PaginationButton
          label="ก่อนหน้า"
          disabled={!canPrev || loading}
          onClick={() => onPageChange?.(page - 1)}
          icon="prev"
        />

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {totalPages <= 7 ? (
            // Show all pages if total is small
            Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationButton
                key={pageNum}
                label={pageNum.toString()}
                active={pageNum === page}
                onClick={() => onPageChange?.(pageNum)}
                disabled={loading}
                variant="page"
              />
            ))
          ) : (
            // Show smart pagination with ellipsis
            getPageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">…</span>
              ) : (
                <PaginationButton
                  key={pageNum}
                  label={pageNum.toString()}
                  active={pageNum === page}
                  onClick={() => onPageChange?.(pageNum)}
                  disabled={loading}
                  variant="page"
                />
              )
            ))
          )}
        </div>

        {/* Next & Last */}
        <PaginationButton
          label="ถัดไป"
          disabled={!canNext || loading}
          onClick={() => onPageChange?.(page + 1)}
          icon="next"
        />
        <PaginationButton
          label="สุดท้าย"
          disabled={!canNext || loading}
          onClick={() => onPageChange?.(totalPages)}
          icon="last"
        />
      </div>
    </motion.div>
  );
}

// Enhanced Pagination Button Component
function PaginationButton({ 
  label, 
  onClick, 
  disabled, 
  active = false, 
  icon = null,
  variant = 'default'
}) {
  const getIcon = () => {
    switch (icon) {
      case 'first': return '⏮';
      case 'prev': return '◀';
      case 'next': return '▶';
      case 'last': return '⏭';
      default: return null;
    }
  };

  const baseClasses = `
    relative px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
    disabled:cursor-not-allowed select-none
  `;

  const variants = {
    default: disabled 
      ? 'text-gray-400 border-gray-200 bg-gray-50'
      : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100',
    page: disabled
      ? 'text-gray-400 border-gray-200 bg-gray-50'
      : active
        ? 'text-white border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25'
        : 'text-gray-700 border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      <span className="flex items-center justify-center gap-1">
        {icon && <span className="text-xs">{getIcon()}</span>}
        {label}
      </span>
      
      {/* Active indicator */}
      {active && (
        <motion.div
          layoutId="activePageIndicator"
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
          style={{ zIndex: -1 }}
        />
      )}
    </motion.button>
  );
}

export default VirtualTable;