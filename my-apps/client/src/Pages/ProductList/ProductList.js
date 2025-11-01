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
  const reserveList = useSelector((state) => state.reserve.data);
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
  }, [materialType, itemsPerPage, dispatch]);

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
    const normalized = Array.isArray(value)
      ? value
      : String(value || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

    setMaterialType(normalized);
    setCurrentPage(1);
    setSearchValue('');
  }, []);

  const handleProductClick = useCallback((product) => {
    setItem(product);
    setModalOn(true);
    setReserveSection(true);
  }, []);

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
  const handleReserveTabClick = useCallback(() => setReserveSection(true), []);
  const handleCancelReserveTabClick = useCallback(() => {
    if (item && userToken) {
      dispatch(fetchReserveData(item, userToken.Name, 'ProductPage'));
      setReserveSection(false);
    }
  }, [item, userToken, dispatch]);
  const handleReserveValueChange = useCallback((e) => setReserveValue(e.target.value), []);
  const handleRadioChange = useCallback((value) => setRadioValue(value), []);
  const handleReserveSubmit = useCallback(() => {
    if (item && userToken) {
      dispatch(insertReserveData(item, reserveValue, item, userToken.Name, 'ProductPage'));
    }
  }, [item, reserveValue, userToken, dispatch]);
  const handleReserveCancel = useCallback(() => {
    dispatch(deleteReserveData(item, radioValue));
  }, [item, radioValue, dispatch]);

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

      {/* Modal */}
      {modalOn && item && (
        <Modal item={item} setModalOn={setModalOn}>
          <div className="p-6">
            <div className="mb-6 pb-4 border-b-2 border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
                {item.ItemCode}
              </h3>
              <p className="text-slate-600 ml-5 mt-1 font-medium">{item.Name}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={handleReserveTabClick}
                className={`py-4 text-sm font-bold transition-all ${
                  reserveSection
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                📦 จอง
              </button>
              <button
                onClick={handleCancelReserveTabClick}
                className={`py-4 text-sm font-bold transition-all ${
                  !reserveSection
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                ❌ ยกเลิกการจอง
              </button>
            </div>

            {reserveSection ? (
              <Fragment>
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border-2 border-slate-200 mb-6">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="px-3 py-4 font-bold text-slate-700 w-40">👤 Sale Name</td>
                        <td className="px-3 py-4 text-slate-900 font-semibold">{userToken?.Name}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-4 font-bold text-slate-700">📊 จำนวน จอง</td>
                        <td className="px-3 py-4">
                          <input
                            type="number"
                            value={reserveValue}
                            onChange={handleReserveValueChange}
                            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="กรอกจำนวนที่ต้องการจอง"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={handleReserveSubmit}
                  className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  ✅ ยืนยันการจอง
                </button>
              </Fragment>
            ) : (
              <Fragment>
                <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden mb-6 shadow-sm">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-slate-100 to-blue-50 text-slate-700 sticky top-0 z-10 border-b-2 border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">เลือก</th>
                          <th className="px-4 py-3 text-left font-bold">ItemCode</th>
                          <th className="px-4 py-3 text-left font-bold">ItemName</th>
                          <th className="px-4 py-3 text-left font-bold">Qty</th>
                          <th className="px-4 py-3 text-left font-bold">Pack</th>
                          <th className="px-4 py-3 text-left font-bold">SaleCode</th>
                          <th className="px-4 py-3 text-left font-bold">SaleName</th>
                          <th className="px-4 py-3 text-left font-bold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reserveList && reserveList.length > 0 ? (
                          reserveList.map((reserve, index) => (
                            <tr key={`reserve-${index}`} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                              <td className="px-4 py-3">
                                <input
                                  type="radio"
                                  name="reserve-radio"
                                  value={reserve}
                                  onChange={() => handleRadioChange(reserve)}
                                  className="w-5 h-5 text-blue-600 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 font-semibold text-blue-600">{reserve.itemCode}</td>
                              <td className="px-4 py-3 font-medium">{reserve.itemName}</td>
                              <td className="px-4 py-3 font-semibold">{reserve.Qty}</td>
                              <td className="px-4 py-3">{reserve.pack}</td>
                              <td className="px-4 py-3">{reserve.SaleCode}</td>
                              <td className="px-4 py-3">{reserve.SaleName}</td>
                              <td className="px-4 py-3 text-slate-600">{reserve.docdateT}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="px-4 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                  <span className="text-3xl">📭</span>
                                </div>
                                <span className="font-medium">ไม่มีรายการจอง</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button
                  onClick={handleReserveCancel}
                  className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  🗑️ ยืนยันยกเลิกการจอง
                </button>
              </Fragment>
            )}
          </div>
        </Modal>
      )}
    </Fragment>
  );
};

export default ProductList;