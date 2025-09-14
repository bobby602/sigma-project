import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import AuthContext from '../../../Store/auth-context';
import API_CONFIG from '../../../config/api';

const NewLoginPage = (props) => {
    const [input, setInput] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(''); // เพิ่ม state สำหรับ error message
    const [isLoading, setIsLoading] = useState(false); // เพิ่ม loading state
    
    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();
    
    const submitHandler = async (e) => {
        e.preventDefault();
        setError(''); // รีเซ็ต error message
        setIsLoading(true);
        
        try {
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`;
            
            console.log('Making request to:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(input),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                // Handle error response
                let errorMessage = 'เข้าสู่ระบบไม่สำเร็จ';
                
                try {
                    const errorData = await response.json();
                    console.log('Error response:', errorData);
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    console.log('Could not parse error response');
                }
                
                // ตรวจสอบ status code เฉพาะ
                if (response.status === 401) {
                    errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
                } else if (response.status === 429) {
                    errorMessage = 'ส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
                } else if (response.status === 500) {
                    errorMessage = 'เกิดข้อผิดพลาดระบบ กรุณาลองใหม่อีกครั้ง';
                }
                
                setError(errorMessage);
                authCtx.failLogin();
                return;
            }

            const data = await response.json();
            console.log('📦 Response data:', data);
            
            // Handle successful login
            let user;
            if (data.success) {
                user = data.user;
            } else if (data.result && data.result[0] && data.result[0][0]) {
                user = data.result[0][0];
            } else {
                throw new Error('Invalid response format');
            }
            
            authCtx.onLogin(data);
            
            // Navigate based on user role
            if (user.StAdmin === '1') {
                navigate("/MainPage");
            } else if (user.StAdmin === '2') {
                navigate("/SalesPage");
            } else if (user.StAdmin === '3') {
                navigate("/PriceList");
            }
            
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
        } finally {
            setIsLoading(false);
        }
    };
    
    const userInput = (e) => {
        setInput({
            ...input,
            username: e.target.value
        });
        // เคลียร์ error เมื่อผู้ใช้เริ่มพิมพ์ใหม่
        if (error) setError('');
    };
    
    const passInput = (e) => {
        setInput({
            ...input,
            password: e.target.value
        });
        // เคลียร์ error เมื่อผู้ใช้เริ่มพิมพ์ใหม่
        if (error) setError('');
    };
    
    return (
        <form onSubmit={submitHandler}>
            {/* แสดง Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}
            
            <div className="mb-6 mt-4">
                <label htmlFor="username" className="block mb-2 text-base font-medium text-gray-900 dark:text-dark-300">
                    UserName
                </label>
                <input 
                    type="text" 
                    id="username" 
                    value={input.username}
                    onChange={userInput} 
                    className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={isLoading}
                />
            </div>
            
            <div className="mb-6">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-dark">
                    Password
                </label>
                <input 
                    type="password" 
                    id="password" 
                    value={input.password}
                    onChange={passInput} 
                    className={`bg-white-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                        error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={isLoading}
                />
            </div>
            
            <div className="col-12 buttonLoginPage">
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                        isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800'
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            กำลังเข้าสู่ระบบ...
                        </div>
                    ) : 'เข้าสู่ระบบ'}
                </button>
            </div>
        </form>
    );
};

export default NewLoginPage;