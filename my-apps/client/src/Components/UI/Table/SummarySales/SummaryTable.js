import React, { Fragment, useMemo, useState } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  UserIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const SummaryTable = ({
  data = [],                 // ✅ ข้อมูลแค่ของ "หน้านี้" จาก server
  totalRow = null,           // ✅ แถวรวมทั้งช่วงวันที่ (optional)
  getLink,
  pagination = {},
  onPageChange,
  onPageSizeChange
}) => {
  const {
    page = 1,
    limit = 20,
    total = 0,          // ✅ จำนวนทั้งหมดจาก server (ไม่นับแถว "รวม")
    totalPages = 1,
    hasPrev = false,
    hasNext = false
  } = pagination;

  // ===== Utilities =====
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [hoveredRow, setHoveredRow] = useState(null);

  const parseCurrency = (value) => {
    if (!value) return 0;
    const cleanValue = String(value).replace(/,/g, '');
    return parseFloat(cleanValue) || 0;
  };
  const formatCurrency = (value) => {
    const num = parseCurrency(value);
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  // Sort (เฉพาะชุดของหน้าปัจจุบัน)
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'NetAmt' || sortConfig.key === 'Target') {
        aValue = parseCurrency(aValue);
        bValue = parseCurrency(bValue);
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Summary cards (ใช้ totalRow ถ้ามี เพื่อสะท้อนยอดรวมทั้งช่วงวันที่)
  const summaryStats = useMemo(() => {
    if (totalRow) {
      const totalNetAmt = parseCurrency(totalRow.NetAmt);
      const totalTarget = parseCurrency(totalRow.Target);
      return {
        totalNetAmt,
        totalTarget,
        avgNetAmt: data.length ? totalNetAmt / total : 0,
        customerCount: total, // ทั้งหมด (จาก server)
        achievementRate: totalTarget > 0 ? (totalNetAmt / totalTarget) * 100 : 0
      };
    }
    // fallback: คิดจากหน้าปัจจุบัน
    const totalNetAmt = data.reduce((sum, item) => sum + parseCurrency(item.NetAmt), 0);
    const totalTarget = data.reduce((sum, item) => sum + parseCurrency(item.Target), 0);
    return {
      totalNetAmt,
      totalTarget,
      avgNetAmt: data.length ? totalNetAmt / data.length : 0,
      customerCount: total,
      achievementRate: totalTarget > 0 ? (totalNetAmt / totalTarget) * 100 : 0
    };
  }, [data, totalRow, total]);

  const HeaderCell = ({ label, columnKey, Icon }) => {
    const active = sortConfig.key === columnKey;
    const asc = sortConfig.direction === 'asc';
    return (
      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
        <button
          type="button"
          onClick={() =>
            setSortConfig(prev => ({
              key: columnKey,
              direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
            }))
          }
          className="flex items-center space-x-2 group select-none"
          title="คลิกเพื่อเรียง"
        >
          {Icon && <Icon className="w-4 h-4" />}
          <span>{label}</span>
          <span className="inline-flex items-center">
            {active ? (asc ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />) : <ChevronUpIcon className="w-4 h-4 opacity-0" />}
          </span>
        </button>
      </th>
    );
  };

  const renderDataRow = (row, index) => {
    const netAmt = parseCurrency(row.NetAmt);
    const target = parseCurrency(row.Target);
    const achievement = target > 0 ? (netAmt / target) * 100 : 0;

    return (
      <tr
        key={`${row.CustCode}-${index}`}
        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 
                    hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
                    dark:hover:bg-gray-600 whitespace-nowrap cursor-pointer
                    transition-all duration-200 ${hoveredRow === index ? 'shadow-lg transform scale-[1.01]' : ''}`}
        onMouseEnter={() => setHoveredRow(index)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        <td className="px-6 py-4">
          <button onClick={() => getLink?.(row.CustCode, row.CustName)} className="flex items-center space-x-2 group">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:from-blue-600 group-hover:to-indigo-700 transition-all">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{row.CustCode}</span>
          </button>
        </td>
        <td className="px-6 py-4">
          <span className="text-gray-700 dark:text-gray-300">{row.CustName}</span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className={`${netAmt >= target ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} px-3 py-1 rounded-lg font-medium`}>
              ฿ {formatCurrency(row.NetAmt)}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="text-gray-600 dark:text-gray-400">฿ {formatCurrency(row.Target)}</span>
            {target > 0 && (
              <div className="flex items-center space-x-1">
                {achievement >= 100 ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                    <ArrowTrendingUpIcon className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">{achievement.toFixed(0)}%</span>
                  </div>
                ) : achievement >= 80 ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 rounded-full">
                    <ArrowTrendingUpIcon className="w-3 h-3 text-yellow-600" />
                    <span className="text-xs text-yellow-700 font-medium">{achievement.toFixed(0)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 rounded-full">
                    <ExclamationCircleIcon className="w-3 h-3 text-red-600" />
                    <span className="text-xs text-red-700 font-medium">{achievement.toFixed(0)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderTotalRow = () => {
    if (!totalRow) return null;
    return (
      <tr className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b-2 border-yellow-300 font-bold sticky bottom-0">
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-800">รวม</span>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-800">ยอดรวมทั้งหมด</td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            <span className="text-green-700 text-lg">฿ {formatCurrency(totalRow.NetAmt)}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <TrophyIcon className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 text-lg">฿ {formatCurrency(totalRow.Target)}</span>
          </div>
        </td>
      </tr>
    );
  };

  const renderPageButtons = () => {
    if (totalPages <= 1) return null;
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let startWin = Math.max(1, page - half);
    let endWin = Math.min(totalPages, startWin + windowSize - 1);
    if (endWin - startWin + 1 < windowSize) startWin = Math.max(1, endWin - windowSize + 1);

    const btn = [];
    for (let i = startWin; i <= endWin; i++) {
      btn.push(
        <button
          key={`page-${i}`}
          onClick={() => onPageChange?.(i)}
          className={`px-3 py-2 text-sm rounded-lg ${i === page ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
        >
          {i}
        </button>
      );
    }
    return (
      <>
        {startWin > 1 && (
          <>
            <button onClick={() => onPageChange?.(1)} className="px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50">1</button>
            {startWin > 2 && <span className="text-gray-500">…</span>}
          </>
        )}
        {btn}
        {endWin < totalPages && (
          <>
            {endWin < totalPages - 1 && <span className="text-gray-500">…</span>}
            <button onClick={() => onPageChange?.(totalPages)} className="px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50">{totalPages}</button>
          </>
        )}
      </>
    );
  };

  // Empty state
  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">ไม่พบข้อมูลสรุปยอดขาย</p>
        <p className="text-gray-400 text-sm mt-2">กรุณาเลือกช่วงเวลาเพื่อแสดงข้อมูล</p>
      </div>
    );
  }

  // คำนวณช่วงแสดง (1-based index ของรายการทั้งหมด)
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <Fragment>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">จำนวนลูกค้า</p>
              <p className="text-2xl font-bold">{summaryStats.customerCount}</p>
            </div>
            <UserIcon className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">ยอดขายรวม</p>
              <p className="text-xl font-bold">฿ {formatCurrency(summaryStats.totalNetAmt)}</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">เป้าหมายรวม</p>
              <p className="text-xl font-bold">฿ {formatCurrency(summaryStats.totalTarget)}</p>
            </div>
            <TrophyIcon className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className={`rounded-xl p-4 text-white shadow-lg ${
          summaryStats.achievementRate >= 100 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : summaryStats.achievementRate >= 80 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
            : 'bg-gradient-to-br from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm">% บรรลุเป้า</p>
              <p className="text-2xl font-bold">{summaryStats.achievementRate.toFixed(1)}%</p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-white/80" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full text-base text-left text-gray-500 dark:text-gray-400">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-50">
              <tr>
                <HeaderCell label="รหัสลูกค้า" columnKey="CustCode" Icon={UserIcon} />
                <HeaderCell label="ชื่อลูกค้า" columnKey="CustName" />
                <HeaderCell label="ยอดขาย" columnKey="NetAmt" Icon={CurrencyDollarIcon} />
                <HeaderCell label="เป้าหมาย" columnKey="Target" Icon={TrophyIcon} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedData.map((row, i) => renderDataRow(row, i))}
              {renderTotalRow()}
            </tbody>
          </table>
        </div>

        {/* Footer: Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              หน้า {page} จาก {totalPages} (ทั้งหมด {total} รายการ)
            </span>
            <span className="text-xs text-gray-400">
              แสดง {startIndex}-{endIndex}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              disabled={!hasPrev}
              className="px-3 py-2 text-sm bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ก่อนหน้า
            </button>

            {renderPageButtons()}

            <button
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              disabled={!hasNext}
              className="px-3 py-2 text-sm bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ถัดไป
            </button>

            {/* เปลี่ยน page size (ถ้าต้องการ) */}
            {onPageSizeChange && (
              <select
                value={limit}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
                className="ml-2 px-2 py-1 border rounded-md text-sm"
              >
                {[10, 20, 50, 100].map(sz => <option key={sz} value={sz}>{sz}/หน้า</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>แสดง {sortedData.length} รายการในหน้านี้</div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>บรรลุเป้า</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>ใกล้เป้า (80%+)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>ต่ำกว่าเป้า</span>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SummaryTable;
