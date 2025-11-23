
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { productActions } from '../../Store/product-slice';
import Navbar from '../../Components/UI/Navbar/Navbar';
import Search from '../../Components/Input/Search/Search';
import { 
  CheckIcon, 
  ArrowPathIcon, 
  FunnelIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';
import { fetchPriceList, updatePriceData, updatePriceList } from '../../Store/price-actions';

const PriceList = () => {
  const dispatch = useDispatch();
  
  // ===== Redux Selectors with Default Values =====
  const productState = useSelector(state => state.product) || {};
  const { 
    priceList = [], 
    pagination = { page: 1, limit: 50, total: 0, totalPages: 1 }, 
    isLoading = false 
  } = productState;
  
  // ===== States =====
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    departCode: '',
    showFilters: false
  });
  const [page, setPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [pendingChanges, setPendingChanges] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  const debouncedSearch = useDebounce(search, 500);
  const autoSaveTimerRef = useRef(null);
  const editInputRef = useRef(null);
  const limit = 50;

  // ===== Fetch Data Effect =====
  useEffect(() => {
    dispatch(fetchPriceList({
      page,
      limit,
      search: debouncedSearch,
      departCode: filters.departCode
    }));
  }, [dispatch, page, debouncedSearch, filters.departCode]);

  // ===== Auto-save Effect =====
  useEffect(() => {
    if (Object.keys(pendingChanges).length > 0) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        handleBatchSave();
      }, 3000);
    }
    
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [pendingChanges]);

  // ===== Keyboard Shortcuts Effect =====
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleBatchSave();
      }
      if (e.key === 'Escape' && Object.keys(pendingChanges).length > 0) {
        handleCancelChanges();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingChanges]);

  // ===== Focus Edit Input =====
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // ===== Handle Start Edit =====
  const handleStartEdit = useCallback((row, field) => {
    const key = `${row.ItemCode}-${row.code}-${row.NameFGS}`;
    setEditingCell({ key, field });
    setEditValue(row[field] || '');
  }, []);

  // ===== Handle Save Edit =====
  const handleSaveEdit = useCallback((row, field) => {
    const key = `${row.ItemCode}-${row.code}-${row.NameFGS}`;
    
    if (editValue !== row[field]) {
      setPendingChanges(prev => ({
        ...prev,
        [key]: {
          itemRowAll: row,
          changes: {
            ...(prev[key]?.changes || {}),
            [field]: editValue
          }
        }
      }));

      // Optimistic update
      dispatch(productActions.updatePriceItem({ 
        ItemCode: row.ItemCode, 
        code: row.code,
        NameFGS: row.NameFGS,
        field, 
        value: editValue 
      }));
    }
    
    setEditingCell(null);
    setEditValue('');
  }, [editValue, dispatch]);

  // ===== Handle Cancel Edit =====
  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // ===== Handle Edit Key Down =====
  const handleEditKeyDown = useCallback((e, row, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(row, field);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  // ===== Batch Save =====
  const handleBatchSave = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.info('ไม่มีการเปลี่ยนแปลง', { icon: '💡' });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('กำลังบันทึกข้อมูล...');

    try {
      for (const [key, changeData] of Object.entries(pendingChanges)) {
        const { itemRowAll, changes } = changeData;
        
        for (const [field, value] of Object.entries(changes)) {
          let columnInput = field;
          
          // Map field names
          if (field === 'Price10') columnInput = 'price10';
          else if (field === 'Price25') columnInput = 'price25';
          else if (field === 'Price50') columnInput = 'price50';
          else if (field === 'Price100') columnInput = 'price100';
          else if (field === 'NoteF') columnInput = 'note';
          else if (field === 'priceList') {
            await dispatch(updatePriceList({
              itemRowAll,
              inputValue: value,
              columnInput: 'priceList'
            }));
            continue;
          }
          
          await dispatch(updatePriceData({
            itemRowAll,
            inputValue: value,
            columnInput
          }));
        }
      }
      
      setPendingChanges({});
      
      toast.update(toastId, { 
        render: `บันทึกสำเร็จ ${Object.keys(pendingChanges).length} รายการ ✅`,
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });

      await dispatch(fetchPriceList({
        page,
        limit,
        search: debouncedSearch,
        departCode: filters.departCode
      }));

    } catch (error) {
      console.error('❌ Save error:', error);
      toast.update(toastId, {
        render: 'ไม่สามารถบันทึกข้อมูลได้ ❌',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, dispatch, page, limit, debouncedSearch, filters.departCode]);

  // ===== Cancel Changes =====
  const handleCancelChanges = useCallback(() => {
    setPendingChanges({});
    dispatch(fetchPriceList({
      page,
      limit,
      search: debouncedSearch,
      departCode: filters.departCode
    }));
    toast.info('ยกเลิกการเปลี่ยนแปลง', { icon: '↩️' });
  }, [dispatch, page, limit, debouncedSearch, filters.departCode]);

  // ===== Handle Refresh =====
  const handleRefresh = useCallback(() => {
    setPendingChanges({});
    dispatch(fetchPriceList({
      page,
      limit,
      search: debouncedSearch,
      departCode: filters.departCode
    }));
    toast.success('รีเฟรชข้อมูลแล้ว', { icon: '🔄' });
  }, [dispatch, page, limit, debouncedSearch, filters.departCode]);

  // ===== Handle Search =====
  const handleSearchChange = useCallback((searchValue) => {
    setSearch(searchValue);
    setPage(1);
  }, []);

  // ===== Handle Page Change =====
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ===== Check if editing =====
  const isEditing = (row, field) => {
    if (!editingCell) return false;
    const key = `${row.ItemCode}-${row.code}-${row.NameFGS}`;
    return editingCell.key === key && editingCell.field === field;
  };

  // ===== Check if has changes =====
  const hasCellChanges = (row, field) => {
    const key = `${row.ItemCode}-${row.code}-${row.NameFGS}`;
    return pendingChanges[key]?.changes?.[field] !== undefined;
  };

  // ===== Render Editable Cell =====
  const renderEditableCell = (row, field, isNumeric = false) => {
    const editing = isEditing(row, field);
    const hasChanges = hasCellChanges(row, field);
    const value = row[field] || '';

    if (editing) {
      return (
        <div className="flex items-center space-x-1 px-3 py-2">
          <input
            ref={editInputRef}
            type={isNumeric ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleEditKeyDown(e, row, field)}
            onBlur={() => handleSaveEdit(row, field)}
            className="flex-1 px-2 py-1 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSaveEdit(row, field)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div 
        className={`relative group cursor-pointer px-3 py-2 ${
          hasChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''
        }`}
        onClick={() => handleStartEdit(row, field)}
      >
        <div className="flex items-center justify-between">
          <span>{value || '-'}</span>
          <PencilIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {hasChanges && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
          />
        )}
      </div>
    );
  };

  // Calculate pagination info
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || 0;
  const startItem = ((page - 1) * limit) + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-full mx-auto p-6">
        {/* Header Card with Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">📊 ตารางราคาสินค้า</h1>
              <p className="text-blue-100">
                จัดการราคาสินค้าและคงเหลือในระบบ • แสดง {totalItems.toLocaleString()} รายการ
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <AnimatePresence>
                {Object.keys(pendingChanges).length > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <button
                      onClick={handleCancelChanges}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span>ยกเลิก</span>
                    </button>
                    
                    <motion.button
                      onClick={handleBatchSave}
                      disabled={isSaving}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 font-semibold shadow-lg transition-all"
                    >
                      {isSaving ? (
                        <>
                          <CloudArrowUpIcon className="w-5 h-5 animate-bounce" />
                          <span>กำลังบันทึก...</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-5 h-5" />
                          <span>บันทึก ({Object.keys(pendingChanges).length})</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button
                onClick={handleRefresh}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all"
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span>รีเฟรช</span>
              </motion.button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Search
                value={search}
                onChange={handleSearchChange}
                placeholder="🔍 ค้นหาสินค้า (รหัส, ชื่อ)..."
                className="bg-white/90 backdrop-blur-sm"
              />
            </div>
            
            <button
              onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>ตัวกรอง</span>
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {filters.showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      รหัสแผนก
                    </label>
                    <input
                      type="text"
                      value={filters.departCode}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, departCode: e.target.value }));
                        setPage(1);
                      }}
                      placeholder="กรอกรหัสแผนก..."
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pending Changes Warning */}
        <AnimatePresence>
          {Object.keys(pendingChanges).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800">
                    <strong>มีการเปลี่ยนแปลง {Object.keys(pendingChanges).length} รายการ</strong> 
                    {' '}ที่ยังไม่ได้บันทึก • กด <kbd className="px-2 py-1 bg-amber-200 rounded text-xs">Ctrl+S</kbd> เพื่อบันทึก หรือ <kbd className="px-2 py-1 bg-amber-200 rounded text-xs">Esc</kbd> เพื่อยกเลิก
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0"></div>
              </div>
              <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          ) : priceList && priceList.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">รหัสสินค้า</th>
                      <th className="px-4 py-3 text-left font-semibold">ชื่อสินค้า</th>
                      <th className="px-4 py-3 text-left font-semibold">แผนก</th>
                      <th className="px-4 py-3 text-right font-semibold">ราคาทุน</th>
                      <th className="px-4 py-3 text-right font-semibold">ราคา 10</th>
                      <th className="px-4 py-3 text-right font-semibold">ราคา 25</th>
                      <th className="px-4 py-3 text-right font-semibold">ราคา 50</th>
                      <th className="px-4 py-3 text-right font-semibold">ราคา 100</th>
                      <th className="px-4 py-3 text-right font-semibold">คงเหลือ</th>
                      <th className="px-4 py-3 text-left font-semibold">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceList.map((row, idx) => {
                      if (row.isHeader || row.PackD === 'r') {
                        return (
                          <tr key={`${row.ItemCode}-${idx}`} className="bg-gradient-to-r from-purple-50 to-blue-50">
                            <td colSpan="10" className="px-4 py-3 font-bold text-purple-700">
                              {row.DepartName}
                            </td>
                          </tr>
                        );
                      }

                      const bal = parseFloat(row.bal?.toString().replace(/,/g, '') || 0);
                      
                      return (
                        <tr key={`${row.ItemCode}-${row.code}-${idx}`} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2 font-mono text-blue-600 font-semibold">{row.ItemCode}</td>
                          <td className="px-4 py-2 font-medium">{row.name}</td>
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {row.DepartName}
                            </span>
                          </td>
                          <td className="text-right">{renderEditableCell(row, 'priceList', true)}</td>
                          <td className="text-right">{renderEditableCell(row, 'Price10', true)}</td>
                          <td className="text-right">{renderEditableCell(row, 'Price25', true)}</td>
                          <td className="text-right">{renderEditableCell(row, 'Price50', true)}</td>
                          <td className="text-right">{renderEditableCell(row, 'Price100', true)}</td>
                          <td className="px-4 py-2 text-right">
                            <span className={`font-bold ${
                              bal < 10 ? 'text-red-600' : 
                              bal < 50 ? 'text-orange-500' : 
                              'text-green-600'
                            }`}>
                              {row.bal || '0'}
                            </span>
                          </td>
                          <td>{renderEditableCell(row, 'NoteF', false)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Enhanced Pagination */}
              <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    แสดง <span className="font-semibold text-blue-600">{startItem}</span> - 
                    <span className="font-semibold text-blue-600"> {endItem}</span> จาก 
                    <span className="font-semibold text-blue-600"> {totalItems.toLocaleString()}</span> รายการ
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => handlePageChange(1)}
                      disabled={page === 1}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      « แรก
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ‹ ก่อนหน้า
                    </motion.button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (page <= 3) {
                          pageNum = idx + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = page - 2 + idx;
                        }
                        
                        return (
                          <motion.button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              page === pageNum
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'border border-gray-300 hover:bg-blue-50'
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    <motion.button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ถัดไป ›
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={page >= totalPages}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      สุดท้าย »
                    </motion.button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <div className="text-gray-400">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium text-lg">ไม่พบข้อมูลสินค้า</p>
              <p className="text-gray-400 text-sm">ลองค้นหาด้วยคำค้นอื่น หรือปรับเปลี่ยนตัวกรอง</p>
            </div>
          )}
        </motion.div>

        {/* Keyboard Shortcuts Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">💡 คีย์ลัด:</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
            <span>บันทึก</span>
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
            <span>ยกเลิก</span>
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
            <span>บันทึก cell</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PriceList;