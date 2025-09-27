// import React, { Fragment, useEffect, useState, useMemo } from 'react';
import React, { Fragment, useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CalendarDaysIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import Navbar from "../../Components/UI/Navbar/Navbar";
import SummaryTable from '../../Components/UI/Table/SummarySales/SummaryTable';
import Search from "../../Components/Input/Search/Search";
import { fetchSummaryUserbyDate } from '../../Store/user-list';
import { userList } from '../../Store/userList';
import { toast } from 'react-toastify';

// Logger utility for debugging
const logger = {
  log: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level: 'INFO', message, data };
    console.log(`📊 ${timestamp} ${message}`, data);
    const logs = JSON.parse(localStorage.getItem('summary_debug_logs') || '[]');
    logs.push(entry);
    if (logs.length > 50) logs.shift();
    localStorage.setItem('summary_debug_logs', JSON.stringify(logs));
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level: 'ERROR', message, error: error?.message || error, stack: error?.stack };
    console.error(`❌ ${timestamp} ${message}`, error);
    const logs = JSON.parse(localStorage.getItem('summary_debug_logs') || '[]');
    logs.push(entry);
    if (logs.length > 50) logs.shift();
    localStorage.setItem('summary_debug_logs', JSON.stringify(logs));
  },
  clear: () => {
    localStorage.removeItem('summary_debug_logs');
    console.log('🧹 Summary debug logs cleared');
  },
  get: () => JSON.parse(localStorage.getItem('summary_debug_logs') || '[]')
};

const SummaryPages = () => {
  // ---------- Local state ----------
  const [input, setInput] = useState({ date1Val: '', date2Val: '' });
  const [showValue, setShowValue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  const [dateError, setDateError] = useState({ date1: false, date2: false });

  // 🔹 Server-side paging & search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');


  // ---------- Hooks ----------
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ---------- Redux ----------
//   const userSummaryData = useSelector((state) => state.user.summaryuserData);
//   const reduxLoading = useSelector((state) => state.user.isLoading);
    const { summaryItems, summaryPagination, summaryTotalRow } = useSelector(s => s.user);
    const reduxLoading = useSelector(s => s.user.isLoading);

  // ---------- Token ----------
  const jsonToken = useMemo(() => {
    try {
      const token = sessionStorage.getItem('token');
      return token ? JSON.parse(token) : {};
    } catch (error) {
      logger.error('Token parse error', error);
      return {};
    }
  }, []);

  // ---------- Init by URL ----------
  useEffect(() => {
    const date1 = searchParams.get("date1");
    const date2 = searchParams.get("date2");
    logger.log('Initializing with URL params', { date1, date2 });

    if (date1 && date2) {
      setInput({ date1Val: date1, date2Val: date2 });
      setShowValue(true);

      if (jsonToken.SaleCode) {
        setIsLoading(true);
         dispatch(fetchSummaryUserbyDate({
            date1Val: date1,
            date2Val: date2,
            saleCode: jsonToken.SaleCode,
            page: 1,
            limit,
            search: ''
        }))
          .finally(() => setIsLoading(false));
      }
    }
  }, [searchParams, dispatch, jsonToken.SaleCode]);

  // ---------- Utils ----------
  const validateDate = (dateString) => {
    const re = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!re.test(dateString)) return false;
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const handleDateChange = (field, value) => {
    setInput(prev => ({ ...prev, [field]: value }));
    if (value && !validateDate(value)) {
      setDateError(prev => ({ ...prev, [field.replace('Val', '')]: true }));
    } else {
      setDateError(prev => ({ ...prev, [field.replace('Val', '')]: false }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    logger.log('Form submitted', input);

    if (!validateDate(input.date1Val) || !validateDate(input.date2Val)) {
      toast.error('กรุณากรอกวันที่ในรูปแบบ dd/mm/yyyy ที่ถูกต้อง');
      return;
    }

    const [d1, m1, y1] = input.date1Val.split('/').map(Number);
    const [d2, m2, y2] = input.date2Val.split('/').map(Number);
    const startDate = new Date(y1, m1 - 1, d1);
    const endDate = new Date(y2, m2 - 1, d2);

    if (startDate > endDate) {
      toast.warning('วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setShowValue(true);
      setPage(1); // รีเซ็ตหน้าใหม่ทุกครั้งที่ค้นหา
    await dispatch(fetchSummaryUserbyDate({
        ...input,
        saleCode: jsonToken.SaleCode,
        page: 1,
        limit,
        search
        }));
      toast.success('โหลดข้อมูลสำเร็จ');
      logger.log('Data fetched successfully');
    } catch (err) {
      logger.error('Fetch error', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };

  const getLink = (custCode, custName) => {
    logger.log('Navigating to customer', { custCode, custName });
    navigate({
      pathname: '/CustPage',
      search: `?custCode=${custCode}&date1=${input.date1Val}&date2=${input.date2Val}&custName=${custName}`,
    });
  };

  const backToMenu = () => {
    const defaultPath = jsonToken.StAdmin === '1' ? '/MainPage' : '/SalesPage';
    navigate(defaultPath);
  };

  const handleOnChange = async (val) => {
    setSearch(val);
    setPage(1);
    await loadPage(1, limit, val);
  };


   // 🔹 ฟังก์ชันยิงโหลดหน้า (server-side)
  const loadPage = useCallback(async (p = 1, l = limit, q = search) => {
    if (!jsonToken.SaleCode || !input.date1Val || !input.date2Val) return;
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(fetchSummaryUserbyDate({
        date1Val: input.date1Val,
        date2Val: input.date2Val,
        saleCode: jsonToken.SaleCode,
        page: p,
        limit: l,
        search: q
      }));
      setPage(p);
      setLimit(l);
    } catch (err) {
      logger.error('Fetch summary error', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, input.date1Val, input.date2Val, jsonToken.SaleCode, limit, search]);

  // ---------- Transform data ----------
  const toNumber = (v) => {
    if (typeof v === 'number') return v;
    if (v == null) return 0;
    const s = String(v).replace(/,/g, '').replace(/[^\d.-]/g, '');
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  };

  // ---------- Loading ----------
  if (isLoading || reduxLoading) {
    return (
      <Fragment>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md mx-auto border border-blue-100">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-2 border-blue-200"></div>
              <div className="absolute inset-2 rounded-full border-2 border-blue-400 border-t-transparent animate-spin animation-reverse"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">กำลังโหลดข้อมูลสรุปยอดขาย</h2>
            <p className="text-gray-600 mb-8">กรุณารอสักครู่...</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span>ตรวจสอบช่วงวันที่</span>
              </div>
              <div className="flex items-center justify-center text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                <span>กำลังประมวลผลข้อมูล</span>
              </div>
              <div className="flex items-center justify-center text-gray-400">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                <span>เตรียมแสดงผลรายงาน</span>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={backToMenu}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>กลับหน้าหลัก</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <ChartBarIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">สรุปยอดขาย</h1>
                    <p className="text-gray-600">Sales Summary Report</p>
                  </div>
                </div>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowDebugLogs(!showDebugLogs)}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                >
                  {showDebugLogs ? 'ซ่อน Debug' : 'แสดง Debug'}
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {jsonToken.Name ? jsonToken.Name.charAt(0) : 'U'}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {jsonToken.Name} {jsonToken.SurName}
                  </p>
                  <p className="text-sm text-gray-600">
                    รหัสพนักงานขาย: {jsonToken.SaleCode || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Date form */}
            <form onSubmit={submitHandler} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                    วันที่เริ่มต้น
                  </label>
                  <div className="relative">
                    <input
                      id="date1"
                      type="text"
                      value={input.date1Val}
                      onChange={(e) => handleDateChange('date1Val', e.target.value)}
                      placeholder="dd/mm/yyyy"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        dateError.date1 ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none transition-colors`}
                    />
                    {dateError.date1 && (
                      <div className="absolute right-3 top-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {dateError.date1 && <p className="mt-1 text-sm text-red-600">รูปแบบวันที่ไม่ถูกต้อง</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                    วันที่สิ้นสุด
                  </label>
                  <div className="relative">
                    <input
                      id="date2"
                      type="text"
                      value={input.date2Val}
                      onChange={(e) => handleDateChange('date2Val', e.target.value)}
                      placeholder="dd/mm/yyyy"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        dateError.date2 ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none transition-colors`}
                    />
                    {dateError.date2 && (
                      <div className="absolute right-3 top-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {dateError.date2 && <p className="mt-1 text-sm text-red-600">รูปแบบวันที่ไม่ถูกต้อง</p>}
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading || dateError.date1 || dateError.date2}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>ค้นหาข้อมูล</span>
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {showValue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="mb-6">
                <div className="max-w-md">
                  <Search 
                    Name="ค้นหาชื่อลูกค้า" 
                    handleOnChange={handleOnChange}
                    placeholder="พิมพ์ชื่อลูกค้าเพื่อค้นหา..."
                  />
                </div>
              </div>

              {input.date1Val && input.date2Val && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    <span className="text-lg font-medium text-gray-800">
                      แสดงข้อมูลวันที่: {input.date1Val} - {input.date2Val}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {summaryItems?.length > 0 ? (
                <SummaryTable
                    data={summaryItems}                 // รายการเฉพาะหน้านี้จาก server
                    totalRow={summaryTotalRow}          // แถว "รวม" ทั้งช่วงวันที่
                    getLink={getLink}
                    pagination={summaryPagination}      // {page, limit, total, totalPages, hasPrev, hasNext}
                    onPageChange={(p) => loadPage(p, summaryPagination.limit, search)}
                    onPageSizeChange={(l) => loadPage(1, l, search)}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <ChartBarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">ไม่พบข้อมูลในช่วงเวลาที่เลือก</p>
                  <p className="text-gray-400 text-sm mt-2">กรุณาเลือกช่วงเวลาใหม่</p>
                </div>
              )}
            </motion.div>
          )}


          {showDebugLogs && process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-auto max-h-96"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold">Debug Logs</span>
                <button
                  onClick={() => logger.clear()}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear
                </button>
              </div>
              <pre>{JSON.stringify(logger.get(), null, 2)}</pre>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Fragment>
  );
};

export default SummaryPages;
