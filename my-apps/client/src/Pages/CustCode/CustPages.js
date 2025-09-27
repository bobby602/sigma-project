import React, { Fragment, useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeftIcon,
    UserIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    BuildingOfficeIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Navbar from "../../Components/UI/Navbar/Navbar";
import CustTable from '../../Components/UI/Table/CustTable/CustTable';
import Search from "../../Components/Input/Search/Search";
import { fetchCustomer } from '../../Store/user-list';
import { userList } from '../../Store/userList';
import { toast } from 'react-toastify';

// Logger utility
const logger = {
    log: (message, data = null) => {
        const timestamp = new Date().toISOString();
        console.log(`📋 ${timestamp} ${message}`, data);
    },
    error: (message, error = null) => {
        const timestamp = new Date().toISOString();
        console.error(`❌ ${timestamp} ${message}`, error);
    }
};

const CustPages = () => {
    // State Management
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [customerStats, setCustomerStats] = useState({
        totalOrders: 0,
        totalAmount: 0,
        uniqueProducts: 0,
        avgOrderValue: 0
    });
    
    // Hooks
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Get parameters from URL
    const custCode = searchParams.get("custCode");
    const custName = searchParams.get("custName");
    const date1 = searchParams.get("date1");
    const date2 = searchParams.get("date2");
    
    // Redux Selectors
    const rawCustData = useSelector((state) => state.user.custFilterUserData);
    const reduxLoading = useSelector((state) => state.user.isLoading);
    
    // Parse token safely
    const jsonToken = useMemo(() => {
        try {
            const token = sessionStorage.getItem('token') || sessionStorage.getItem('token2');
            return token ? JSON.parse(token) : {};
        } catch (error) {
            logger.error('Token parse error', error);
            return {};
        }
    }, []);
    
    // Convert data to array format
    const userCustData = useMemo(() => {
        if (!rawCustData) return [];
        
        if (Array.isArray(rawCustData)) {
            return rawCustData;
        }
        
        if (typeof rawCustData === 'object') {
            return Object.values(rawCustData).filter(item => item && typeof item === 'object');
        }
        
        return [];
    }, [rawCustData]);
    
    // Calculate customer statistics
    useEffect(() => {
        if (userCustData && userCustData.length > 0) {
            const stats = userCustData.reduce((acc, item) => {
                // Skip summary rows
                if (item.DocNo === 'รวม') return acc;
                
                const netAmt = parseFloat(String(item.NetAmt || 0).replace(/,/g, '')) || 0;
                
                return {
                    totalOrders: acc.totalOrders + 1,
                    totalAmount: acc.totalAmount + netAmt,
                    products: new Set([...acc.products, item.ItemCode]),
                    amounts: [...acc.amounts, netAmt]
                };
            }, {
                totalOrders: 0,
                totalAmount: 0,
                products: new Set(),
                amounts: []
            });
            
            setCustomerStats({
                totalOrders: stats.totalOrders,
                totalAmount: stats.totalAmount,
                uniqueProducts: stats.products.size,
                avgOrderValue: stats.totalOrders > 0 ? stats.totalAmount / stats.totalOrders : 0
            });
        }
    }, [userCustData]);
    
    // Fetch customer data on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!date1 || !date2 || !custCode) {
                setError('ข้อมูลไม่ครบถ้วน');
                setIsLoading(false);
                return;
            }
            
            try {
                setIsLoading(true);
                setError(null);
                logger.log('Fetching customer data', { date1, date2, custCode });
                
                await dispatch(fetchCustomer(date1, date2, custCode));
                
                logger.log('Customer data fetched successfully');
            } catch (err) {
                logger.error('Failed to fetch customer data', err);
                setError('ไม่สามารถโหลดข้อมูลได้');
                toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [dispatch, date1, date2, custCode]);
    
    // Handlers
    const handleBackOnClick = () => {
        navigate({
            pathname: '/SummaryPages',
            search: `?date1=${date1}&date2=${date2}`,
        });
    };
    
    const handleOnChange = (value) => {
        setSearchValue(value);
        dispatch(userList.searchCustCode(value));
    };
    
    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };
    
    // Loading state
    if (isLoading || reduxLoading) {
        return (
            <Fragment>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md mx-auto border border-blue-100">
                        <div className="relative w-20 h-20 mx-auto mb-8">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">กำลังโหลดข้อมูลลูกค้า</h2>
                        <p className="text-gray-600">{custName}</p>
                        <p className="text-gray-500 text-sm mt-2">กรุณารอสักครู่...</p>
                    </div>
                </div>
            </Fragment>
        );
    }
    
    // Error state
    if (error && !userCustData.length) {
        return (
            <Fragment>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="text-red-500 mb-4">
                                <DocumentTextIcon className="w-16 h-16 mx-auto" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={handleBackOnClick}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                กลับหน้าสรุปยอดขาย
                            </button>
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
                    {/* Header Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        {/* Top Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleBackOnClick}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                                >
                                    <ArrowLeftIcon className="w-5 h-5" />
                                    <span>กลับหน้าสรุปยอดขาย</span>
                                </button>
                                
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                                        <UserIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-800">ทะเบียนลูกค้า</h1>
                                        <p className="text-gray-600">Customer Transaction Details</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Customer Info Card */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">ชื่อลูกค้า</p>
                                            <p className="text-xl font-bold text-gray-800">{custName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">รหัสลูกค้า</p>
                                            <p className="text-lg font-semibold text-gray-800">{custCode}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Date Range & Sales Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">ช่วงเวลา</p>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {date1} - {date2}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <UserIcon className="w-6 h-6 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">พนักงานขาย</p>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {jsonToken.Name} {jsonToken.SurName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md"
                            >
                                <ShoppingCartIcon className="w-6 h-6 mb-2 text-blue-200" />
                                <p className="text-xs text-blue-100">จำนวนรายการ</p>
                                <p className="text-xl font-bold">{customerStats.totalOrders}</p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md"
                            >
                                <CurrencyDollarIcon className="w-6 h-6 mb-2 text-green-200" />
                                <p className="text-xs text-green-100">ยอดรวม</p>
                                <p className="text-lg font-bold">{formatCurrency(customerStats.totalAmount)}</p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md"
                            >
                                <DocumentTextIcon className="w-6 h-6 mb-2 text-purple-200" />
                                <p className="text-xs text-purple-100">สินค้า</p>
                                <p className="text-xl font-bold">{customerStats.uniqueProducts}</p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-md"
                            >
                                <ChartBarIcon className="w-6 h-6 mb-2 text-orange-200" />
                                <p className="text-xs text-orange-100">ค่าเฉลี่ย/รายการ</p>
                                <p className="text-lg font-bold">{formatCurrency(customerStats.avgOrderValue)}</p>
                            </motion.div>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchValue}
                                        onChange={(e) => handleOnChange(e.target.value)}
                                        placeholder="ค้นหาด้วยชื่อสินค้า, รหัสสินค้า, หรือเลขที่เอกสาร..."
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Data Table Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        {userCustData && userCustData.length > 0 ? (
                            <>
                                <div className="mb-4 flex justify-between items-center">
                                    <p className="text-sm text-gray-600">
                                        พบข้อมูล {userCustData.length} รายการ
                                    </p>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        <span>{date1} - {date2}</span>
                                    </div>
                                </div>
                                <CustTable data={userCustData} />
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">ไม่พบข้อมูลการซื้อขาย</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    ลูกค้า {custName} ไม่มีรายการในช่วงเวลานี้
                                </p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </Fragment>
    );
};

export default CustPages;