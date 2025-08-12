import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Styles from './CustomerPage.module.css'
import CustomerList from '../../Components/UI/Table/CustomerLIst/CustomerTable'
import { useSelector, useDispatch } from 'react-redux';
import { user } from '../../Store'
import  { fetchData, checkAuthStatus } from '../../Store/user-list'
import  { searchCustomer } from '../../Store/user-list'
import { userList } from '../../Store/userList'
import Search from "../../Components/Input/Search/Search";

// 🔍 Logger ที่เก็บใน localStorage
const logger = {
    log: (message, data = null) => {
        const timestamp = new Date().toISOString();
        const entry = { timestamp, level: 'INFO', message, data };
        
        console.log(`🔍 ${timestamp} ${message}`, data);
        
        // เก็บใน localStorage
        const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
        logs.push(entry);
        // เก็บแค่ 50 entries ล่าสุด
        if (logs.length > 50) logs.shift();
        localStorage.setItem('debug_logs', JSON.stringify(logs));
    },
    
    error: (message, error = null) => {
        const timestamp = new Date().toISOString();
        const entry = { 
            timestamp, 
            level: 'ERROR', 
            message, 
            error: error?.message || error,
            stack: error?.stack 
        };
        
        console.error(`❌ ${timestamp} ${message}`, error);
        
        const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
        logs.push(entry);
        if (logs.length > 50) logs.shift();
        localStorage.setItem('debug_logs', JSON.stringify(logs));
    },
    
    clear: () => {
        localStorage.removeItem('debug_logs');
        console.log('🧹 Debug logs cleared');
    },
    
    get: () => {
        return JSON.parse(localStorage.getItem('debug_logs') || '[]');
    }
};

const CustomerPage = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [value, setvalue] = useState('');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState({});
    const [showDebugLogs, setShowDebugLogs] = useState(false);
    
    const dispatch = useDispatch();
    const userData = useSelector((state) => state.user.filterData);
    
    // 🔍 Debug function
    const debugTokens = () => {
        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
        
        const info = {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            accessTokenLength: accessToken?.length || 0,
            refreshTokenLength: refreshToken?.length || 0,
            accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null,
            user: user,
            timestamp: new Date().toISOString()
        };
        
        logger.log('Debug Token Info', info);
        setDebugInfo(info);
        return info;
    };

    const handleOnChange = (e, name) => {
        const search = e;
        logger.log(`Search triggered: ${name}`, { searchTerm: search });
        
        if (name === 'ชื่อยาสามัญ และ ชื่อยาการค้า') {
            dispatch(userList.searchCustomer(search));  
        } else {
            dispatch(userList.searchCustomerName(search));
        }
    }

    // 🔍 Enhanced useEffect with persistent logging
    useEffect(() => {
        const initializePage = async () => {
            try {
                logger.log('CustomerPage initializing...');
                
                // 1. Debug tokens
                const tokenInfo = debugTokens();
                
                if (!tokenInfo.hasAccessToken) {
                    logger.error('No access token found - should redirect to login');
                    
                    // เก็บ logs ก่อน redirect
                    logger.log('About to redirect to login - saving logs');
                    
                    setError('No access token - redirecting...');
                    
                    // Delay เล็กน้อยเพื่อให้ logs ถูกบันทึก
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                    return;
                }
                
                // 2. Check auth status first (เปิดกลับมาแล้ว)
                logger.log('Checking auth status...');
                const authResult = await dispatch(checkAuthStatus());
                
                if (!authResult) {
                    // ดึง error details ที่เก็บไว้
                    const lastAuthError = JSON.parse(localStorage.getItem('last_auth_error') || '{}');
                    
                    logger.error('Auth check failed', {
                        authResult,
                        lastAuthError,
                        timestamp: new Date().toISOString()
                    });
                    
                    // ถ้าเป็น 404 = API ไม่มี แต่ไม่ใช่ auth problem
                    if (lastAuthError.status === 404) {
                        logger.log('Auth endpoint not found, but continuing anyway...');
                        // ไม่ต้อง return, ให้ทำงานต่อไป
                    } else {
                        setError(`Authentication failed: ${lastAuthError.status || 'Unknown'} - ${lastAuthError.data?.message || lastAuthError.message || 'No details'}`);
                        return;
                    }
                } else {
                    logger.log('Auth check passed');
                }
                
                // 3. Fetch customer data
                logger.log('Fetching customer data...');
                
                // เพิ่ม delay เพื่อให้ auth settle
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await dispatch(fetchData());
                logger.log('Customer data fetched successfully');
                
                // 4. Fetch search data
                logger.log('Fetching search data...');
                await dispatch(searchCustomer());
                logger.log('Search data fetched successfully');
                
                setIsLoading(false);
                logger.log('CustomerPage initialization complete');
                
            } catch (error) {
                logger.error('CustomerPage initialization failed', error);
                setError(error.message);
                setIsLoading(false);
                
                // ถ้าเป็น auth error ให้ redirect
                if (error.message?.includes('auth') || error.message?.includes('401') || error.message?.includes('403')) {
                    logger.log('Auth error detected - preparing redirect to login');
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                }
            }
        };

        initializePage();
    }, [dispatch]);

    // 🔍 Render debug info if there's an error
    if (error) {
        const debugLogs = logger.get();
        
        return (
            <Fragment>
                <Navbar/>
                {/* Error Page สวยๆ */}
                <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
                    <div className="max-w-4xl mx-auto pt-20">
                        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h1>
                                <p className="text-gray-600">ระบบไม่สามารถโหลดข้อมูลลูกค้าได้ในขณะนี้</p>
                            </div>
                            
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                                    </svg>
                                    <div>
                                        <h3 className="text-red-800 font-semibold mb-1">รายละเอียดข้อผิดพลาด</h3>
                                        <p className="text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    รีโหลดหน้า
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        localStorage.clear();
                                        sessionStorage.clear();
                                        window.location.href = '/login';
                                    }}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    เข้าสู่ระบบใหม่
                                </button>
                                
                                <button 
                                    onClick={() => setShowDebugLogs(!showDebugLogs)}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Debug Logs ({debugLogs.length})
                                </button>
                            </div>

                            {/* Debug Section สวยๆ */}
                            {showDebugLogs && (
                                <div className="border-t border-gray-200 pt-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Debug Information</h3>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <div className="max-h-80 overflow-auto space-y-3">
                                            {debugLogs.slice(-10).reverse().map((log, index) => (
                                                <div key={index} className={`p-4 rounded-xl border ${
                                                    log.level === 'ERROR' 
                                                        ? 'bg-red-50 border-red-200' 
                                                        : 'bg-blue-50 border-blue-200'
                                                }`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`font-medium ${
                                                            log.level === 'ERROR' ? 'text-red-800' : 'text-blue-800'
                                                        }`}>
                                                            {log.message}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-mono">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    {log.data && (
                                                        <pre className="text-xs text-gray-600 bg-white rounded-lg p-3 overflow-auto font-mono">
                                                            {JSON.stringify(log.data, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }

    // 🔄 Loading State สวยๆ
    if (isLoading) {
        return (
            <Fragment>
                <Navbar/>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md mx-auto border border-blue-100">
                        {/* Loading Animation สวยๆ */}
                        <div className="relative w-20 h-20 mx-auto mb-8">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-2 border-blue-200"></div>
                            <div className="absolute inset-2 rounded-full border-2 border-blue-400 border-t-transparent animate-spin animation-reverse"></div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">กำลังโหลดข้อมูล</h2>
                        <p className="text-gray-600 mb-8">กรุณารอสักครู่...</p>
                        
                        {/* Progress Steps สวยๆ */}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-center text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                                <span>ตรวจสอบการยืนยันตัวตน</span>
                            </div>
                            <div className="flex items-center justify-center text-blue-600">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                                <span>กำลังโหลดข้อมูลลูกค้า</span>
                            </div>
                            <div className="flex items-center justify-center text-gray-400">
                                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                                <span>เตรียมข้อมูลสำหรับแสดงผล</span>
                            </div>
                        </div>

                        {/* Debug Info สำหรับ Development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <button 
                                    onClick={() => setShowDebugLogs(!showDebugLogs)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                                >
                                    {showDebugLogs ? 'ซ่อน' : 'แสดง'} Debug Logs ({logger.get().length})
                                </button>
                                
                                {showDebugLogs && (
                                    <div className="mt-4 max-h-32 overflow-auto bg-gray-50 rounded-lg p-3 text-left">
                                        {logger.get().slice(-5).map((log, index) => (
                                            <div key={index} className="text-xs text-gray-600 mb-2 font-mono">
                                                <span className="text-gray-400">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                                <span className="ml-2">{log.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <Navbar/>
            
            {/* Main Content สวยๆ */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <div className="max-w-7xl mx-auto p-6">
                    
                    {/* Header Section สวยๆ */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            
                            {/* Title Section */}
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-600 bg-clip-text text-transparent mb-2">
                                        ทะเบียนลูกค้า
                                    </h1>
                                    <p className="text-gray-600">จัดการข้อมูลลูกค้าและติดตามรายการสั่งซื้อ</p>
                                </div>
                            </div>

                            {/* Debug Controls (ใน Development เท่านั้น) */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                                    <button 
                                        onClick={debugTokens}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm shadow-sm"
                                        title="Debug token info"
                                    >
                                        🔍 Debug
                                    </button>
                                    
                                    <button 
                                        onClick={() => setShowDebugLogs(!showDebugLogs)}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 text-sm shadow-sm"
                                        title="Show debug logs"
                                    >
                                        📋 Logs ({logger.get().length})
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Section สวยๆ */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">ค้นหาข้อมูลลูกค้า</h2>
                            <p className="text-gray-600 text-sm">ใช้ฟิลเตอร์ด้านล่างเพื่อค้นหาลูกค้าที่ต้องการ</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    🔍 ค้นหาตามชื่อลูกค้า
                                </label>
                                <div className="relative">
                                    <Search Name='ชื่อลูกค้า' handleOnChange={handleOnChange} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    💊 ค้นหาตามชื่อยาและยาการค้า
                                </label>
                                <div className="relative">
                                    <Search Name='ชื่อยาสามัญ และ ชื่อยาการค้า' handleOnChange={handleOnChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section สวยๆ */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">รายการลูกค้าทั้งหมด</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        แสดงข้อมูล {userData?.length || 0} รายการ
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <CustomerList data={userData} />
                        </div>
                    </div>

                    {/* Debug Panel สวยๆ (Development เท่านั้น) */}
                    {showDebugLogs && process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">Debug Information</h3>
                                    <p className="text-sm text-gray-600 mt-1">ข้อมูลสำหรับการแก้ไขปัญหา</p>
                                </div>
                                <button 
                                    onClick={() => setShowDebugLogs(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <div className="max-h-80 overflow-auto space-y-4">
                                    {logger.get().slice(-10).reverse().map((log, index) => (
                                        <div key={index} className={`p-4 rounded-xl border transition-all duration-200 ${
                                            log.level === 'ERROR' 
                                                ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                                                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                        }`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`font-medium ${
                                                    log.level === 'ERROR' ? 'text-red-800' : 'text-blue-800'
                                                }`}>
                                                    {log.message}
                                                </span>
                                                <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            {log.data && (
                                                <details className="mt-3">
                                                    <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                                                        แสดงรายละเอียด
                                                    </summary>
                                                    <pre className="text-xs text-gray-600 bg-white rounded-lg p-3 mt-2 overflow-auto font-mono border">
                                                        {JSON.stringify(log.data, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
}

export default CustomerPage;