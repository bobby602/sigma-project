import React, { Fragment, useEffect, useState, useCallback, useMemo } from 'react';
import Navbar from "../../Components/UI/Navbar/Navbar";
import ProductTable from '../../Components/UI/Table/ProductTable/ProductTable';
import Search from '../../Components/Input/Search/Search';
import Selectbox from '../../Components/Input/SelectBox/Selectbox';
import Modal from '../../Components/Input/Modal/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { productActions } from '../../Store/product-slice';
import { fetchCartData } from '../../Store/product-list';
import { fetchReserveData, deleteReserveData, insertReserveData } from '../../Store/reserve-list';

const ProductList = () => {
  // ============= States =============
  const [modalOn, setModalOn] = useState(false);
  const [item, setItem] = useState(null);
  const [reserveSection, setReserveSection] = useState(true);
  const [reserveValue, setReserveValue] = useState('');
  const [radioValue, setRadioValue] = useState('');
  const [materialType, setMaterialType] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchValue, setSearchValue] = useState('');

  // ============= Redux =============
  const dispatch = useDispatch();
  const productState = useSelector((state) => state.product);
  const reserveState = useSelector((state) => state.reserve);
  const reserveList = reserveState?.data || [];
  const isReserveLoading = reserveState?.isLoading || false;
  const serverPagination = productState?.pagination;
  const isLoading = productState?.isLoading || false;

  // ============= Session Data =============
  const userToken = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("token"));
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }, []);

  // ============= Options =============
  const materialTypeOptions = useMemo(() => [
    { label: 'RM - วัตถุดิบ', value: '1' },
    { label: 'TE - เทสต์', value: '2' },
    { label: 'SI & SF', value: '3,4' }
  ], []);

  // ============= Pagination =============
  const pagination = useMemo(() => {
    if (serverPagination) {
      return {
        page: serverPagination.page || 1,
        limit: serverPagination.limit || itemsPerPage,
        total: serverPagination.totalItems || 0,
        totalPages: serverPagination.totalPages || 1,
        hasNext: serverPagination.hasNext ?? false,
        hasPrev: serverPagination.hasPrev ?? false,
      };
    }
    return {
      page: 1,
      limit: itemsPerPage,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    };
  }, [serverPagination, itemsPerPage]);

  // ============= Fetch Data =============
  useEffect(() => {
    if (Array.isArray(materialType) && materialType.length > 0) {
      dispatch(fetchCartData({
        e: materialType,
        page: 1,
        limit: itemsPerPage,
        search: searchValue,
        sortBy: 'ItemCode',
        sortOrder: 'ASC',
      }));
      setCurrentPage(1);
    }
  }, [materialType, itemsPerPage, dispatch]); // eslint-disable-line

  useEffect(() => {
    if (!Array.isArray(materialType) || materialType.length === 0) return;
    const loadData = async () => {
      try {
        await dispatch(
          fetchCartData({
            e: materialType,
            page: currentPage,
            limit: itemsPerPage,
            search: searchValue,
            sortBy: 'ItemCode',
            sortOrder: 'ASC',
          })
        );
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadData();
  }, [dispatch, currentPage, itemsPerPage, materialType, searchValue]);

  // ============= Handlers =============
  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
    setCurrentPage(1);
    if (Array.isArray(materialType) && materialType.length > 0) {
      dispatch(fetchCartData({
        e: materialType,
        page: 1,
        limit: itemsPerPage,
        search: value,
        sortBy: 'ItemCode',
        sortOrder: 'ASC',
      }));
    }
  }, [dispatch, materialType, itemsPerPage]);

  const handleMaterialTypeChange = useCallback((value) => {
    const normalized = String(Array.isArray(value) ? value.join(',') : (value ?? ''))
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setMaterialType(normalized);
    setCurrentPage(1);
    setSearchValue('');
  }, []);

  const handleProductClick = useCallback(async (product) => {
    console.log('🔍 Opening modal for product:', product);
    
    setItem(product);
    setModalOn(true);
    setReserveSection(true);
    setReserveValue('');
    setRadioValue('');
    
    // ส่งข้อมูลครบถ้วนไปที่ fetchReserveData
    if (userToken && product) {
      try {
        await dispatch(fetchReserveData({
          itemCode: product.ItemCode,
          saleName: userToken.Name,
          nameFGS: product.NameFGS || '',
          code: product.Code || '',
        }));
        console.log('✅ Reserve data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading reserve data:', error);
      }
    }
  }, [userToken, dispatch]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    dispatch(fetchCartData({
      e: materialType,
      page: newPage,
      limit: itemsPerPage,
      search: searchValue,
      sortBy: 'ItemCode',
      sortOrder: 'ASC',
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, materialType, itemsPerPage, searchValue]);

  const handleItemsPerPageChange = useCallback((newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    if (Array.isArray(materialType) && materialType.length > 0) {
      dispatch(fetchCartData({
        e: materialType,
        page: 1,
        limit: newLimit,
        search: searchValue,
        sortBy: 'ItemCode',
        sortOrder: 'ASC',
      }));
    }
  }, [dispatch, materialType, searchValue]);

  // ============= Modal Handlers =============
  const handleReserveTabClick = useCallback(() => {
    setReserveSection(true);
    setReserveValue('');
  }, []);

  const handleCancelReserveTabClick = useCallback(async () => {
    if (item && userToken) {
      setReserveSection(false);
      setRadioValue('');
      // Refresh reserve data when switching to cancel tab
      try {
        await dispatch(fetchReserveData({
          itemCode: item.ItemCode,
          saleName: userToken.Name,
          nameFGS: item.NameFGS || '',
          code: item.Code || '',
        }));
      } catch (error) {
        console.error('❌ Error refreshing reserve data:', error);
      }
    }
  }, [item, userToken, dispatch]);

  const handleReserveValueChange = useCallback((e) => {
    setReserveValue(e.target.value);
  }, []);

  const handleRadioChange = useCallback((value) => {
    setRadioValue(value);
  }, []);

  const handleReserveSubmit = useCallback(async () => {
    if (item && userToken && reserveValue) {
      try {
        await dispatch(insertReserveData(item, reserveValue, userToken.Name));
        setReserveValue('');
        setModalOn(false);
      } catch (error) {
        console.error('❌ Error submitting reservation:', error);
      }
    }
  }, [item, reserveValue, userToken, dispatch]);

  const handleReserveCancel = useCallback(async () => {
    if (item && radioValue) {
      const confirmed = window.confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?');
      if (!confirmed) return;

      try {
        await dispatch(deleteReserveData(item, radioValue));
        setRadioValue('');
        // Keep modal open to show updated list
        // Refresh the list
        await dispatch(fetchReserveData({
          itemCode: item.ItemCode,
          saleName: userToken.Name,
          nameFGS: item.NameFGS || '',
          code: item.Code || '',
        }));
      } catch (error) {
        console.error('❌ Error canceling reservation:', error);
      }
    }
  }, [item, radioValue, userToken, dispatch]);

  const handleCloseModal = useCallback(() => {
    setModalOn(false);
    setItem(null);
    setReserveValue('');
    setRadioValue('');
    setReserveSection(true);
  }, []);

  return (
    <Fragment>
      <Navbar />

      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/50 p-8 transition-all hover:shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ทะเบียนผลิตภัณฑ์</h1>
                  <p className="text-slate-600 mt-1 font-medium">จัดการข้อมูลสินค้าและการจอง</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center px-6 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="text-sm font-medium text-slate-600">ทั้งหมด</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {pagination.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">รายการ</div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 px-4 py-2 bg-slate-50 rounded-lg">
                  <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-mono">{new Date().toLocaleTimeString('th-TH')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/50 p-6">
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  ค้นหาสินค้า
                </label>
                <Search handleOnChange={handleSearchChange} />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Material Type
                </label>
                <Selectbox
                  options={materialTypeOptions}
                  value={materialType}
                  name="เลือก Material Type"
                  getValue={handleMaterialTypeChange}
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  แสดงต่อหน้า
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-slate-300"
                >
                  <option value={20}>20 รายการ</option>
                  <option value={50}>50 รายการ</option>
                  <option value={100}>100 รายการ</option>
                  <option value={200}>200 รายการ</option>
                  <option value={500}>500 รายการ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden relative min-h-[600px]">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full inline-block"></span>
                    {isLoading && (
                      <span className="absolute -right-1 top-0 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      รายการสินค้า
                      {isLoading && (
                        <span className="text-sm font-medium text-blue-600 animate-pulse">กำลังโหลด...</span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 font-medium">
                      หน้าที่ <span className="font-bold text-blue-600">{pagination.page}</span> จาก <span className="font-bold">{pagination.totalPages}</span>
                      <span className="mx-2 text-slate-400">•</span>
                      แสดง <span className="font-bold text-indigo-600">{productState.rows?.length || 0}</span> รายการ
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 font-medium">
                  รายการ <span className="font-bold text-blue-600">{((pagination.page - 1) * pagination.limit) + 1}</span> 
                  {' '}-{' '}
                  <span className="font-bold text-blue-600">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                  {' '}จาก{' '}
                  <span className="font-bold text-slate-900">{pagination.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-indigo-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                  </div>
                  <div className="mt-4">
                    <p className="text-lg font-bold text-slate-800 animate-pulse">กำลังโหลดข้อมูล...</p>
                    <p className="text-sm text-slate-600 mt-1">กรุณารอสักครู่</p>
                  </div>
                  <div className="w-48 h-1 bg-slate-200 rounded-full mt-4 overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-progress"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Table or Empty State */}
            {!isLoading && (
              <div>
                {productState.rows && productState.rows.length > 0 ? (
                  <ProductTable
                    data={productState.rows}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    handleOnClick={handleProductClick}
                    hasSearch={!!searchValue}
                  />
                ) : (
                  <div className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลสินค้า</h3>
                      <p className="text-slate-600 text-center max-w-md">
                        {materialType.length === 0 
                          ? '🏷️ กรุณาเลือก Material Type เพื่อเริ่มค้นหาสินค้า' 
                          : '🔍 ไม่พบสินค้าในหมวดหมู่ที่เลือก ลองเปลี่ยนเงื่อนไขการค้นหา'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============= Modal ============= */}
      {modalOn && item && (
        <Modal item={item} setModalOn={handleCloseModal}>
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{item.Name || 'สินค้า'}</h2>
                <p className="text-sm text-slate-600 mt-1">
                  <span className="font-semibold">รหัส:</span> {item.ItemCode || '-'} 
                  <span className="mx-2">•</span>
                  <span className="font-semibold">แผนก:</span> {item.DepartName || '-'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={handleReserveTabClick}
              disabled={isReserveLoading}
              className={`flex-1 px-6 py-3 font-semibold transition-all ${
                reserveSection
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:bg-white/50'
              } ${isReserveLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              📦 จองสินค้า
            </button>
            <button
              onClick={handleCancelReserveTabClick}
              disabled={isReserveLoading}
              className={`flex-1 px-6 py-3 font-semibold transition-all ${
                !reserveSection
                  ? 'bg-white text-red-600 border-b-2 border-red-600'
                  : 'text-slate-600 hover:bg-white/50'
              } ${isReserveLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ❌ ยกเลิกการจอง
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 relative">
            {/* Loading Overlay for Reserve Section */}
            {isReserveLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-medium text-slate-600 mt-3">กำลังโหลด...</p>
                </div>
              </div>
            )}

            {/* Product Info Summary */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-4 mb-6 border border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-600 font-medium">คงเหลือ</p>
                  <p className="text-lg font-bold text-blue-600">{item.QBal || '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">จองแล้ว</p>
                  <p className="text-lg font-bold text-orange-600">{item.Reserve || '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">คงเหลือสุทธิ</p>
                  <p className="text-lg font-bold text-green-600">{item.BAL || '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">ราคา</p>
                  <p className="text-lg font-bold text-slate-900">{item.price || '0'}</p>
                </div>
              </div>
            </div>

            {/* Reserve Section */}
            {reserveSection ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    จำนวนที่ต้องการจอง
                  </label>
                  <input
                    type="number"
                    value={reserveValue}
                    onChange={handleReserveValueChange}
                    placeholder="ใส่จำนวนที่ต้องการจอง"
                    min="0"
                    disabled={isReserveLoading}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-slate-900 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    💡 คงเหลือสุทธิที่สามารถจองได้: <span className="font-bold text-blue-600">{item.BAL || '0'}</span>
                  </p>
                </div>

                <button
                  onClick={handleReserveSubmit}
                  disabled={!reserveValue || Number(reserveValue) <= 0 || isReserveLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {isReserveLoading ? '⏳ กำลังบันทึก...' : '✅ ยืนยันการจอง'}
                </button>
              </div>
            ) : (
              /* Cancel Reserve Section */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    เลือกรายการที่ต้องการยกเลิก
                  </label>
                  
                  {reserveList && Array.isArray(reserveList) && reserveList.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {reserveList
                        .filter(r => r.itemCode === item.ItemCode || r.ItemCode === item.ItemCode)
                        .map((reserve, idx) => {
                          const reserveId = String(reserve.ID || reserve.id || idx);
                          const qty = reserve.QTY || reserve.Qty || reserve.qty || '0';
                          const userName = reserve.SaleName || reserve.UserName || reserve.userName || '-';
                          const displayDate = reserve.docdateT || 
                                            (reserve.docdate ? new Date(reserve.docdate).toLocaleDateString('th-TH') : '') ||
                                            (reserve.ReserveDate ? new Date(reserve.ReserveDate).toLocaleDateString('th-TH') : '-');
                          
                          return (
                            <label
                              key={reserveId}
                              className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                radioValue === reserveId
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30'
                              } ${isReserveLoading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="reserve"
                                  value={reserveId}
                                  checked={radioValue === reserveId}
                                  onChange={(e) => handleRadioChange(e.target.value)}
                                  disabled={isReserveLoading}
                                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    จำนวน: <span className="text-red-600">{qty}</span>
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    โดย: {userName}
                                    {displayDate !== '-' && (
                                      <span className="ml-2">• {displayDate}</span>
                                    )}
                                  </p>
                                  {reserve.Note && (
                                    <p className="text-xs text-slate-500 mt-1">
                                      💬 {reserve.Note}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                      <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-slate-600 font-medium">ไม่มีรายการจอง</p>
                      <p className="text-sm text-slate-500 mt-1">สินค้านี้ยังไม่มีการจอง</p>
                    </div>
                  )}
                </div>

                {reserveList && Array.isArray(reserveList) && reserveList.length > 0 && (
                  <button
                    onClick={handleReserveCancel}
                    disabled={!radioValue || isReserveLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {isReserveLoading ? '⏳ กำลังยกเลิก...' : '🗑️ ยกเลิกการจองที่เลือก'}
                  </button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </Fragment>
  );
};

export default ProductList;