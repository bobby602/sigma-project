import { Fragment, useRef, useEffect, useState, useCallback } from 'react'
import Table from '../../../Input/Table/Table';
import Styles from './CustomerTable.module.css';
import Modal from '../../../Input/Modal/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { user } from '../../../../Store'
import { userList } from '../../../../Store/userList'

const CustomerTable = (data) => {
    let dataTable = "";
    const [modalOn, setModalOn] = useState(false);
    const [item, setItem] = useState();
    const [numberRow, setNumberRow] = useState('');
    const [itemRowAll, setItemRowAll] = useState();
    const [columnInput, setColumnInput] = useState('');
    const [openInput, setOpenInput] = useState(false);
    const [inputValue, setInputValue] = useState();
    const custDataByCustCode = useSelector((state) => state.user.CustRegDataByCustCode);
    const dispatch = useDispatch();
    let token = sessionStorage.getItem('token');
    let jsonToken = JSON.parse(token);
    console.log(custDataByCustCode)

    const handleOnClick = (e) => {
        const items = e.Code;
        const Name = e.Name;
        setItem(e);
        console.log(e.Code)
        dispatch(userList.getCustRegByCustCode(items));
        setModalOn(true);
    }

    console.log(custDataByCustCode.length);

    const formatDate = (date) => {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [day, month, year].join('/');
    }

    if (data.data) {
        dataTable = data.data.map((e, index) => {
            return (
                <tr key={e.number} className="group bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border-b border-gray-100 hover:shadow-md">
                    <td className="px-6 py-4">
                        <button
                            onClick={() => handleOnClick(e)}
                            className="group-hover:scale-105 transition-transform duration-200 font-semibold text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1"
                        >
                            <span className="flex items-center space-x-2">
                                <svg className="w-4 h-4 opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span>{e.Code}</span>
                            </span>
                        </button>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {e.Name ? e.Name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{e.Name}</div>
                                <div className="text-sm text-gray-500">รหัส: {e.Code}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-700">{e.Phone || 'ไม่ระบุ'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-indigo-50 z-10">
                        <div className="flex items-center space-x-2 max-w-xs">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-700 truncate" title={e.addr}>
                                {e.addr || 'ไม่ระบุที่อยู่'}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                e.MaxCr > 50000 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : e.MaxCr > 10000 
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                                ₿ {e.MaxCr ? e.MaxCr.toLocaleString() : '0'}
                            </div>
                        </div>
                    </td>
                </tr>
            )
        })
    }

    return (
        <Fragment>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <Table>
                    {/* Enhanced Header */}
                    <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white sticky top-0 z-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span>รหัส</span>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>ชื่อลูกค้า</span>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>เบอร์โทร</span>
                                </div>
                            </th>
                            <th scope="col" className="sticky left-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider z-50">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>ที่อยู่</span>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    <span>วงเงิน</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {dataTable || (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <div className="text-gray-500">
                                            <p className="text-lg font-medium">ไม่พบข้อมูลลูกค้า</p>
                                            <p className="text-sm">ลองค้นหาด้วยคำอื่นหรือเพิ่มลูกค้าใหม่</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Enhanced Modal */}
            {modalOn && (
                <Modal item={item} setModalOn={setModalOn}>
                    <div className="p-6">
                        {/* Modal Header */}
                        <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {item?.Name ? item.Name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{item?.Name}</h3>
                                <p className="text-gray-600">รหัสลูกค้า: {item?.Code}</p>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-orange-400 to-yellow-500 text-white sticky top-0 z-10">
                                        {custDataByCustCode.length === 0 ? (
                                            <tr>
                                                <th scope="col" className="text-center px-6 py-4 font-semibold">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span>ตารางทะเบียน</span>
                                                    </div>
                                                </th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th scope="col" className="px-6 py-4 text-left font-semibold">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                        </svg>
                                                        <span>ชื่อสามัญ</span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left font-semibold">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                        <span>ชื่อการค้า</span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left font-semibold">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span>เลขทะเบียน</span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left font-semibold">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                                                        </svg>
                                                        <span>วันหมดอายุ</span>
                                                    </div>
                                                </th>
                                            </tr>
                                        )}
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {custDataByCustCode.length === 0 ? (
                                            <tr>
                                                <td className="px-6 py-12">
                                                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                                                            <img 
                                                                className="w-12 h-12 opacity-50" 
                                                                src={process.env.PUBLIC_URL + "/icons/folder.png"} 
                                                                alt="No data folder icon" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-xl font-medium text-gray-700 mb-1">ไม่พบข้อมูล</p>
                                                            <p className="text-gray-500">ไม่มีข้อมูลทะเบียนสำหรับลูกค้าคนนี้</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            custDataByCustCode.map((e, index) => {
                                                const isExpired = new Date(e.DateExp) < new Date();
                                                return (
                                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="font-medium text-gray-900">{e.ItemName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-gray-700">{e.ItemNameS}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                <span className="font-mono text-sm text-gray-700">{e.RegNo}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-2">
                                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    isExpired 
                                                                        ? 'bg-red-100 text-red-800 border border-red-200' 
                                                                        : 'bg-green-100 text-green-800 border border-green-200'
                                                                }`}>
                                                                    <div className="flex items-center space-x-1">
                                                                        <svg className={`w-3 h-3 ${isExpired ? 'text-red-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                                                                        </svg>
                                                                        <span>{formatDate(Date.parse(e.DateExp))}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </Fragment>
    )
}

export default CustomerTable;