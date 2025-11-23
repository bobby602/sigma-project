import Navbar from "../../Components/UI/Navbar/Navbar";
import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ClipboardDocumentListIcon, 
    CurrencyDollarIcon, 
    ArchiveBoxIcon,
    CalculatorIcon,
    ChartBarIcon,
    UserGroupIcon,
    DocumentTextIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const MainPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const menuItems = [
        {
            title: "รายการสินค้า แยกตามประเภท",
            description: "ดูรายการสินค้าทั้งหมด แยกตามหมวดหมู่",
            path: "/ProductList",
            icon: ArchiveBoxIcon,
            gradient: "from-blue-500 to-cyan-500",
            color: "blue"
        },
        {
            title: "บันทึกรายการสินค้าตามแพ็คกิ้ง",
            description: "จัดการราคาและแพ็คกิ้งสินค้า",
            path: "/PriceList",
            icon: CurrencyDollarIcon,
            gradient: "from-purple-500 to-pink-500",
            color: "purple"
        },
        {
            title: "ข้อมูลลูกค้า",
            description: "จัดการข้อมูลและประวัติลูกค้า",
            path: "/CustomerPage",
            icon: UserGroupIcon,
            gradient: "from-emerald-500 to-teal-500",
            color: "emerald"
        },
        {
            title: "สรุปยอดขาย",
            description: "รายงานและสรุปยอดขายทั้งหมด",
            path: "/SummaryPages",
            icon: ChartBarIcon,
            gradient: "from-orange-500 to-red-500",
            color: "orange"
        },
        {
            title: "รหัสลูกค้า",
            description: "จัดการรหัสและโครงสร้างลูกค้า",
            path: "/CustPage",
            icon: DocumentTextIcon,
            gradient: "from-indigo-500 to-blue-500",
            color: "indigo"
        },
        {
            title: "ทะเบียนสินค้า",
            description: "ระบบจัดการทะเบียนสินค้า (เร็วๆนี้)",
            path: "#",
            icon: ClipboardDocumentListIcon,
            gradient: "from-gray-400 to-gray-500",
            color: "gray",
            disabled: true
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <Fragment>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
                <Navbar />
                
                {/* Hero Section with Background */}
                <div className="relative overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            className="w-full h-full object-cover opacity-10"
                            src={process.env.PUBLIC_URL + "/icons/S__9453600.jpg"}
                            alt="Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                    </div>

                    {/* Hero Content */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8"
                    >
                        <div className="max-w-7xl mx-auto text-center">
                            {/* Welcome Badge */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6"
                            >
                                <SparklesIcon className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    ยินดีต้อนรับสู่ระบบจัดการ Sigma Group
                                </span>
                            </motion.div>

                            {/* Main Title */}
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
                            >
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    ระบบบริหารจัดการ
                                </span>
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg sm:text-xl text-gray-600 mb-2"
                            >
                                จัดการสินค้า ลูกค้า และยอดขายได้อย่างมีประสิทธิภาพ
                            </motion.p>

                            {/* Current Time */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-sm text-gray-500"
                            >
                                {currentTime.toLocaleDateString('th-TH', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    weekday: 'long'
                                })} | {currentTime.toLocaleTimeString('th-TH')}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Menu Cards Section */}
                <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-7xl mx-auto"
                    >
                        {/* Section Header */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                เมนูหลัก
                            </h2>
                            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        </motion.div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                const isDisabled = item.disabled;
                                
                                const CardContent = (
                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={!isDisabled ? { 
                                            y: -8, 
                                            transition: { type: "spring", stiffness: 300 } 
                                        } : {}}
                                        className={`
                                            group relative h-full bg-white rounded-2xl shadow-lg overflow-hidden
                                            ${!isDisabled ? 'hover:shadow-2xl cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                                            transition-all duration-300
                                        `}
                                    >
                                        {/* Gradient Background */}
                                        <div className={`
                                            absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 
                                            ${!isDisabled ? 'group-hover:opacity-10' : ''}
                                            transition-opacity duration-300
                                        `}></div>

                                        {/* Card Content */}
                                        <div className="relative p-6">
                                            {/* Icon */}
                                            <div className={`
                                                w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} 
                                                flex items-center justify-center mb-4 shadow-lg
                                                ${!isDisabled ? 'group-hover:scale-110' : ''}
                                                transition-transform duration-300
                                            `}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                                                {item.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {item.description}
                                            </p>

                                            {/* Arrow Icon */}
                                            {!isDisabled && (
                                                <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                                                    เข้าสู่ระบบ
                                                    <svg 
                                                        className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" 
                                                        fill="none" 
                                                        viewBox="0 0 24 24" 
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            )}

                                            {isDisabled && (
                                                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                                                    เร็วๆ นี้
                                                </div>
                                            )}
                                        </div>

                                        {/* Decorative Elements */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                                    </motion.div>
                                );

                                return isDisabled ? (
                                    <div key={index}>
                                        {CardContent}
                                    </div>
                                ) : (
                                    <Link key={index} to={item.path}>
                                        {CardContent}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Quick Stats */}
                        <motion.div 
                            variants={itemVariants}
                            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {[
                                { label: "ระบบที่ใช้งานได้", value: "5", suffix: "เมนู", color: "blue" },
                                { label: "การตอบสนอง", value: "< 2", suffix: "วินาที", color: "green" },
                                { label: "ความปลอดภัย", value: "100", suffix: "%", color: "purple" }
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center"
                                >
                                    <div className={`text-3xl font-bold bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 bg-clip-text text-transparent mb-1`}>
                                        {stat.value}
                                        <span className="text-xl ml-1">{stat.suffix}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </Fragment>
    );
}

export default MainPage;