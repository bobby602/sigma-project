import React, { Fragment, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from "../../Components/UI/Navbar/Navbar";
import { 
  ChartBarIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CalendarDaysIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const SalesPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  // Get user data from session
  let token = sessionStorage.getItem('token2');
  let jsonToken = token ? JSON.parse(token) : {};

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('สวัสดีตอนเช้า');
    } else if (hour < 18) {
      setGreeting('สวัสดีตอนบ่าย');
    } else {
      setGreeting('สวัสดีตอนเย็น');
    }
  }, [currentTime]);

  // Menu items with enhanced data
  const menuItems = [
    {
      title: "ทะเบียนลูกค้า",
      description: "จัดการข้อมูลลูกค้าและประวัติการซื้อ",
      link: "/CustomerPage",
      icon: UsersIcon,
      gradient: "from-blue-500 to-blue-600",
      color: "blue"
    },
    {
      title: "สรุปยอดขาย",
      description: "รายงานและสถิติการขายประจำวัน",
      link: "/SummaryPages",
      icon: ChartBarIcon,
      gradient: "from-green-500 to-green-600",
      color: "green"
    },
    {
      title: "Price List",
      description: "ตารางราคาสินค้าและการจัดการสต็อก",
      link: "/ProductList",
      icon: DocumentTextIcon,
      gradient: "from-purple-500 to-purple-600",
      color: "purple"
    }
  ];

  // Stats data (you can fetch real data here)
  const stats = [
    {
      title: "ยอดขายวันนี้",
      value: "฿125,430",
      change: "+12.5%",
      icon: CurrencyDollarIcon,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "ลูกค้าใหม่",
      value: "24",
      change: "+8.2%",
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "คำสั่งซื้อ",
      value: "156",
      change: "+15.3%",
      icon: BanknotesIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <Fragment>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Navbar />
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                {greeting}
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                ยินดีต้อนรับสู่ระบบจัดการการขาย
              </p>
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <CalendarDaysIcon className="w-5 h-5" />
                <span>{currentTime.toLocaleDateString('th-TH', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              {jsonToken.Name && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
                >
                  <span className="text-gray-700">พนักงานขาย: </span>
                  <span className="font-semibold text-blue-600 ml-1">{jsonToken.Name}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                      </div>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Menu Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Link to={item.link} className="block">
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      
                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {item.description}
                        </p>
                        
                        {/* Action Button */}
                        <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                          <span className="mr-2">เข้าสู่ระบบ</span>
                          <EyeIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>

                      {/* Hover Effect Border */}
                      <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:${item.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Actions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                การดำเนินการด่วน
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "รายงานวันนี้", color: "bg-blue-500", link: "/SummaryPages" },
                  { name: "เพิ่มลูกค้า", color: "bg-green-500", link: "/CustomerPage" },
                  { name: "ตรวจสอบสต็อก", color: "bg-purple-500", link: "/ProductList" },
                  { name: "ประวัติการขาย", color: "bg-orange-500", link: "/SummaryPages" }
                ].map((action, index) => (
                  <Link
                    key={action.name}
                    to={action.link}
                    className={`${action.color} text-white p-4 rounded-xl text-center font-medium hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg`}
                  >
                    {action.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SalesPage;