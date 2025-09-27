import React, { Fragment, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronUpIcon, 
    ChevronDownIcon,
    DocumentTextIcon,
    CalendarDaysIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    CubeIcon,
    TagIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import Table from '../../../Input/Table/Table';
import Styles from './CustTable.module.css';

const CustTable = ({ data }) => {
    // State for sorting and interactions
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [hoveredRow, setHoveredRow] = useState(null);
    const [selectedRows, setSelectedRows] = useState(new Set());
    
    // Parse token
    const jsonToken = useMemo(() => {
        try {
            const token = sessionStorage.getItem('token');
            return token ? JSON.parse(token) : {};
        } catch {
            return {};
        }
    }, []);
    
    // Convert data to array
    const dataArray = useMemo(() => {
        if (!data) return [];
        
        if (Array.isArray(data)) {
            return data;
        }
        
        if (typeof data === 'object') {
            return Object.values(data).filter(item => item && typeof item === 'object');
        }
        
        return [];
    }, [data]);
    
    // Parse and format currency
    const parseCurrency = (value) => {
        if (!value) return 0;
        const cleanValue = String(value).replace(/,/g, '');
        return parseFloat(cleanValue) || 0;
    };
    
    const formatCurrency = (value) => {
        const num = parseCurrency(value);
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };
    
    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        
        // If already in DD/MM/YYYY format
        if (dateStr.includes('/')) return dateStr;
        
        // Convert from other formats if needed
        try {
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return dateStr;
        }
    };
    
    // Sorting function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return dataArray;
        
        return [...dataArray].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];
            
            // Handle special row "รวม"
            if (a.DocNo === 'รวม') return 1;
            if (b.DocNo === 'รวม') return -1;
            
            // Parse currency values for numeric sorting
            if (['NetAmt', 'Amt', 'Price'].includes(sortConfig.key)) {
                aValue = parseCurrency(aValue);
                bValue = parseCurrency(bValue);
            }
            
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [dataArray, sortConfig]);
    
    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        const filtered = dataArray.filter(item => item.DocNo !== 'รวม');
        const totalNetAmt = filtered.reduce((sum, item) => sum + parseCurrency(item.NetAmt), 0);
        const totalItems = filtered.length;
        const uniqueProducts = new Set(filtered.map(item => item.ItemCode)).size;
        const avgTransaction = totalItems > 0 ? totalNetAmt / totalItems : 0;
        
        return {
            totalNetAmt,
            totalItems,
            uniqueProducts,
            avgTransaction
        };
    }, [dataArray]);
    
    // Column header component
    const ColumnHeader = ({ column, title, icon: Icon, align = 'left' }) => (
        <th 
            scope="col" 
            className={`px-6 py-4 text-${align} cursor-pointer hover:bg-opacity-80 transition-all`}
            onClick={() => handleSort(column)}
        >
            <div className={`flex items-center ${align === 'right' ? 'justify-end' : 'justify-between'} group`}>
                <div className="flex items-center space-x-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="font-semibold uppercase tracking-wider text-sm">
                        {title}
                    </span>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortConfig.key === column ? (
                        sortConfig.direction === 'asc' ? 
                            <ChevronUpIcon className="w-4 h-4" /> : 
                            <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                        <div className="w-4 h-4" />
                    )}
                </div>
            </div>
        </th>
    );
    
    // Row selection handler
    const handleRowSelect = (docNo) => {
        const newSelection = new Set(selectedRows);
        if (newSelection.has(docNo)) {
            newSelection.delete(docNo);
        } else {
            newSelection.add(docNo);
        }
        setSelectedRows(newSelection);
    };
    
    // Render table rows
    const renderTableRows = () => {
        return sortedData.map((row, index) => {
            const isTotal = row.DocNo === 'รวม';
            const isSelected = selectedRows.has(row.DocNo);
            const docDate = row.docdate || row.DocDate;
            
            if (isTotal) {
                // Special styling for total row
                return (
                    <motion.tr 
                        key={`total-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.01 }}
                        className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b-2 border-yellow-300 font-bold sticky bottom-0"
                    >
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-yellow-500 rounded-lg">
                                    <ChartBarIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-gray-800">สรุปยอด</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-gray-800">-</td>
                        <td className="px-6 py-4 text-gray-800">-</td>
                        <td className="px-6 py-4 text-gray-800">รวมทั้งหมด</td>
                        <td className="px-6 py-4 text-gray-800">-</td>
                        <td className="px-6 py-4 text-gray-800">-</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                                <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                                <span className="text-green-700 text-lg">฿ {formatCurrency(row.NetAmt)}</span>
                            </div>
                        </td>
                    </motion.tr>
                );
            }
            
            // Regular data rows
            return (
                <motion.tr 
                    key={`${row.DocNo}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.01 }}
                    className={`
                        bg-white border-b dark:bg-gray-800 dark:border-gray-700 
                        hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 
                        dark:hover:bg-gray-600 whitespace-nowrap
                        transition-all duration-200 cursor-pointer
                        ${hoveredRow === index ? 'shadow-lg transform scale-[1.01]' : ''}
                        ${isSelected ? 'bg-blue-50' : ''}
                    `}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => handleRowSelect(row.DocNo)}
                >
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                                {formatDate(docDate)}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <DocumentTextIcon className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                                {row.DocNo}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <TagIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300 font-mono">
                                {row.ItemCode}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-gray-700 dark:text-gray-300">
                            {row.ItemName}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <CubeIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                {row.Package || '-'}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-gray-700 font-medium">
                            ฿ {formatCurrency(row.Amt)}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className={`
                            px-3 py-1 rounded-lg font-medium
                            ${parseCurrency(row.NetAmt) > 0 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'}
                        `}>
                            ฿ {formatCurrency(row.NetAmt)}
                        </span>
                    </td>
                </motion.tr>
            );
        });
    };
    
    // Empty state
    if (!dataArray || dataArray.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">ไม่พบข้อมูลการซื้อขาย</p>
                <p className="text-gray-400 text-sm mt-2">ไม่มีรายการในช่วงเวลาที่เลือก</p>
            </div>
        );
    }
    
    return (
        <Fragment>
            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">รายการทั้งหมด</p>
                            <p className="text-2xl font-bold">{summaryStats.totalItems}</p>
                        </div>
                        <DocumentTextIcon className="w-8 h-8 text-purple-200" />
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">มูลค่ารวม</p>
                            <p className="text-xl font-bold">฿ {formatCurrency(summaryStats.totalNetAmt)}</p>
                        </div>
                        <CurrencyDollarIcon className="w-8 h-8 text-green-200" />
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">สินค้า</p>
                            <p className="text-2xl font-bold">{summaryStats.uniqueProducts}</p>
                        </div>
                        <CubeIcon className="w-8 h-8 text-blue-200" />
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">เฉลี่ย/รายการ</p>
                            <p className="text-xl font-bold">฿ {formatCurrency(summaryStats.avgTransaction)}</p>
                        </div>
                        <ChartBarIcon className="w-8 h-8 text-orange-200" />
                    </div>
                </motion.div>
            </div>
            
            {/* Main Table without double scroll */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-auto max-h-[600px]">
                    <table className="w-full text-base text-left text-gray-500 dark:text-gray-400">
                        <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white sticky top-0 z-50">
                            <tr>
                                <ColumnHeader column="docdate" title="วันที่" icon={CalendarDaysIcon} />
                                <ColumnHeader column="DocNo" title="เลขที่เอกสาร" icon={DocumentTextIcon} />
                                <ColumnHeader column="ItemCode" title="รหัสสินค้า" icon={TagIcon} />
                                <ColumnHeader column="ItemName" title="ชื่อสินค้า" icon={null} />
                                <ColumnHeader column="Package" title="บรรจุภัณฑ์" icon={CubeIcon} />
                                <ColumnHeader column="Amt" title="ราคา" icon={null} align="right" />
                                <ColumnHeader column="NetAmt" title="มูลค่า" icon={CurrencyDollarIcon} align="right" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {renderTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Table Footer */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <div>
                    แสดง {dataArray.length} รายการ
                    {selectedRows.size > 0 && (
                        <span className="ml-2 text-blue-600">
                            (เลือก {selectedRows.size} รายการ)
                        </span>
                    )}
                </div>
                <div className="text-right">
                    <span className="text-gray-500">คลิกที่แถวเพื่อเลือกรายการ</span>
                </div>
            </div>
        </Fragment>
    );
};

export default CustTable;