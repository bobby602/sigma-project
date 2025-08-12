import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { productActions } from '../../Store/product-slice';
import { fetchPriceList } from '../../Store/product-list';
import Navbar from '../../Components/UI/Navbar/Navbar';
import VirtualTable from '../../Components/UI/Table/VirtualTable';
import Search from '../../Components/Input/Search/Search';
import { CheckIcon, ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';

const PriceList = () => {
  const dispatch = useDispatch();
  const { priceList, isLoading: loading } = useSelector(state => state.product);
  
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    departCode: ''
  });
  const [page, setPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  const debouncedSearch = useDebounce(search, 500);
  const autoSaveTimerRef = useRef(null);

  // Fetch data on mount and when filters change
  useEffect(() => {
    dispatch(fetchPriceList({
      page,
      limit: 50,
      search: debouncedSearch,
      departCode: filters.departCode
    }));
  }, [dispatch, page, debouncedSearch, filters.departCode]);

  // Auto-save functionality
  useEffect(() => {
    if (Object.keys(pendingChanges).length > 0) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        handleBatchSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }
    
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [pendingChanges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleBatchSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingChanges]);

  // Handle cell change
  const handleCellChange = useCallback((itemCode, nameFGS, code, field, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [itemCode]: {
        ...prev[itemCode],
        [field]: value
      }
    }));

    // Update local state for responsive UI using existing Redux actions
    dispatch(productActions.updatePriceItem({ itemCode, field, value }));
  }, [dispatch]);

  // Batch save
  const handleBatchSave = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.info('ไม่มีการเปลี่ยนแปลง');
      return;
    }

    setIsAutoSaving(true);
    try {
      // You'll need to implement the actual API call here
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingChanges({});
      toast.success('บันทึกข้อมูลสำเร็จ');
    } catch (error) {
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsAutoSaving(false);
    }
  }, [pendingChanges]);

  // Handle refresh
  const handleRefresh = () => {
    setPendingChanges({});
    dispatch(fetchPriceList({
      page,
      limit: 50,
      search: debouncedSearch,
      departCode: filters.departCode
    }));
  };

  // Handle search change
  const handleSearchChange = useCallback((searchValue) => {
    setSearch(searchValue);
    dispatch(productActions.filterPriceList(searchValue));
  }, [dispatch]);

  // Define columns
  const columns = [
    {
      key: 'ItemCode',
      label: 'รหัสสินค้า',
      width: 120,
      frozen: true,
      sortable: true
    },
    {
      key: 'name',
      label: 'ชื่อสินค้า',
      width: 250,
      frozen: true,
      sortable: true
    },
    {
      key: 'Price10',
      label: 'ราคา 10 กก.',
      width: 120,
      editable: true,
      type: 'number',
      render: (value, row) => (
        <EditableCell
          value={value}
          onChange={(newValue) => handleCellChange(row.ItemCode, row.NameFGS, row.code, 'price10', newValue)}
          type="currency"
          hasChanges={pendingChanges[row.ItemCode]?.price10 !== undefined}
        />
      )
    },
    {
      key: 'Price25',
      label: 'ราคา 25 กก.',
      width: 120,
      editable: true,
      type: 'number',
      render: (value, row) => (
        <EditableCell
          value={value}
          onChange={(newValue) => handleCellChange(row.ItemCode, row.NameFGS, row.code, 'price25', newValue)}
          type="currency"
          hasChanges={pendingChanges[row.ItemCode]?.price25 !== undefined}
        />
      )
    },
    {
      key: 'Price50',
      label: 'ราคา 50 กก.',
      width: 120,
      editable: true,
      type: 'number',
      render: (value, row) => (
        <EditableCell
          value={value}
          onChange={(newValue) => handleCellChange(row.ItemCode, row.NameFGS, row.code, 'price50', newValue)}
          type="currency"
          hasChanges={pendingChanges[row.ItemCode]?.price50 !== undefined}
        />
      )
    },
    {
      key: 'Price100',
      label: 'ราคา 100 กก.',
      width: 120,
      editable: true,
      type: 'number',
      render: (value, row) => (
        <EditableCell
          value={value}
          onChange={(newValue) => handleCellChange(row.ItemCode, row.NameFGS, row.code, 'price100', newValue)}
          type="currency"
          hasChanges={pendingChanges[row.ItemCode]?.price100 !== undefined}
        />
      )
    },
    {
      key: 'BAL',
      label: 'คงเหลือ',
      width: 100,
      render: (value) => (
        <span className={`font-semibold ${value < 10 ? 'text-red-600' : 'text-green-600'}`}>
          {value?.toLocaleString() || 0}
        </span>
      )
    },
    {
      key: 'ReserveQTY',
      label: 'จองแล้ว',
      width: 100,
      render: (value) => value?.toLocaleString() || 0
    },
    {
      key: 'NoteF',
      label: 'หมายเหตุ',
      width: 200,
      editable: true,
      type: 'text',
      render: (value, row) => (
        <EditableCell
          value={value}
          onChange={(newValue) => handleCellChange(row.ItemCode, row.NameFGS, row.code, 'note', newValue)}
          type="text"
          hasChanges={pendingChanges[row.ItemCode]?.note !== undefined}
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-full mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">ตารางราคาสินค้า</h1>
              <p className="text-gray-600 mt-1">จัดการราคาสินค้าตามขนาดบรรจุ</p>
            </div>
            
            {/* Save indicator */}
            <div className="flex items-center space-x-4">
              {isAutoSaving && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="ml-2">กำลังบันทึก...</span>
                </div>
              )}
              
              {Object.keys(pendingChanges).length > 0 && !isAutoSaving && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-sm text-orange-600">
                    มีการเปลี่ยนแปลง {Object.keys(pendingChanges).length} รายการ
                  </span>
                  <button
                    onClick={handleBatchSave}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    บันทึก (Ctrl+S)
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Search
                Name="ค้นหาสินค้า"
                handleOnChange={handleSearchChange}
              />
            </div>
            
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <VirtualTable
                data={priceList}
                columns={columns}
                height={600}
                onRowClick={(row) => console.log('Row clicked:', row)}
                highlightChanges={pendingChanges}
              />
              
              {/* Pagination */}
              <div className="border-t px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    แสดง {((page - 1) * 50) + 1} - {Math.min(page * 50, priceList.length)} จาก {priceList.length} รายการ
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ก่อนหน้า
                    </button>
                    
                    <span className="px-3 py-1">
                      หน้า {page}
                    </span>
                    
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={priceList.length < 50}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Editable Cell Component
const EditableCell = ({ value, onChange, type = 'text', hasChanges }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value) {
      onChange(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const formatDisplay = (val) => {
    if (type === 'currency' && val) {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0
      }).format(val);
    }
    return val || '-';
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type === 'currency' ? 'number' : 'text'}
        value={editValue || ''}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`
        cursor-pointer px-2 py-1 rounded transition-colors
        ${hasChanges ? 'bg-yellow-100' : 'hover:bg-gray-100'}
      `}
    >
      {formatDisplay(value)}
    </div>
  );
};

export default PriceList;