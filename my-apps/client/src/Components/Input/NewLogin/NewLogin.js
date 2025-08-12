import styles from './NewLogin.css'
import { Link, useNavigate } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../Store/auth-context';
import Card from '../../UI/Card/Card';
import API_CONFIG from '../../../config/api';

const NewLoginPage = (props) => {
    const [input, setInput] = useState({
        username: '',
        password: ''
    })
    const [isLogin, setIsLogin] = useState(true);
    let token = sessionStorage.getItem('token');
    let jsonToken = JSON.parse(token);
    const [Login, setLogin] = useState({
        isLogin: '',
        username: ''
    });
    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();
    
    const submitHandler = (e) => {
        e.preventDefault();
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`;
        
        console.log('Making request to:', url); // Debug log
        
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(input),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => {
                console.log('Response status:', res.status); // Debug log
                if (res.ok) {
                    return res.json();
                } else {
                    return res.json().then((data) => {
                        console.log('Error response:', data); // Debug log
                        let errorMessage = data.message || 'Authentication failed!';
                        authCtx.failLogin();
                        throw new Error(errorMessage);
                    });
                }
            })
            .then((data) => {
                console.log('📦 Response data:', data)
                
                // ✅ รองรับทั้ง format เก่าและใหม่
                let user;
                if (data.success) {
                    // Format ใหม่
                    user = data.user;
                } else if (data.result && data.result[0] && data.result[0][0]) {
                    // Format เก่า
                    user = data.result[0][0];
                } else {
                    throw new Error('Invalid response format');
                }
                
                authCtx.onLogin(data);
                
                // ✅ ใช้ user object ที่ได้
                if (user.StAdmin === '1') {
                    navigate("/MainPage");
                } else if (user.StAdmin === '2') {
                    navigate("/SalesPage");
                } else if (user.StAdmin === '3') {
                    navigate("/PriceList");
                }
            })
            .catch((err) => {
                console.error('Login error:', err); // Debug log
                alert(err.message);
            });
    }
    
    const userInput = (e) => {
        setInput({
            ...input,
            username: e.target.value
        })
    }
    
    const passInput = (e) => {
        setInput({
            ...input,
            password: e.target.value
        })
    }
    
    return (
        <form onSubmit={submitHandler}>
            <div className="mb-6 mt-4">
                <label htmlFor="username" className="block mb-2 text-base font-medium text-gray-900 dark:text-dark-300">UserName</label>
                <input 
                    type="text" 
                    id="username" 
                    onChange={userInput} 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                    required
                />
            </div>
            <div className="mb-6">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-dark">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    onChange={passInput} 
                    className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                    required
                />
            </div>
            <div className="col-12 buttonLoginPage">
                <button 
                    type="submit" 
                    className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                >
                    Login
                </button>
            </div>
        </form>
    );
}

export default NewLoginPage;