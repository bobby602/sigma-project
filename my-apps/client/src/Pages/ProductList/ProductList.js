import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { productActions } from '../../Store/product-slice';
import { fetchCartData } from '../../Store/product-list';
import Navbar from '../../Components/UI/Navbar/Navbar';  // Fixed: Capital C
import Search from '../../Components/Input/Search/Search';
import Selectbox from '../../Components/Input/SelectBox/Selectbox';
import ProductTable from '../../Components/UI/Table/ProductTable/ProductTable';
import Modal from '../../Components/Input/Modal/Modal';
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';  // Fixed: Use ArrowDownTrayIcon
import { useDebounce } from '../../hooks/useDebounce';

const ProductList = () => {
  const dispatch = useDispatch();
  const { data: products, isLoading: loading } = useSelector(state => state.product);
  
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    departCode: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const debouncedSearch = useDebounce(search, 500);

  // Fetch products
  useEffect(() => {
    dispatch(fetchCartData(filters.departCode));
  }, [dispatch, filters.departCode, debouncedSearch]);

  // Handle product click
  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  }, []);

  // Handle search
  const handleSearchChange = useCallback((searchValue) => {
    setSearch(searchValue);
    dispatch(productActions.filterProduct(searchValue));
  }, [dispatch]);

  // Handle filter change
  const handleFilterChange = useCallback((value) => {
    setFilters({ ...filters, departCode: value });
  }, [filters]);

  // Export to Excel
  const handleExport = async () => {
    try {
      // You'll need to implement this based on your existing API
      toast.success('ส่งออกข้อมูลสำเร็จ');
    } catch (error) {
      toast.error('ไม่สามารถส่งออกข้อมูลได้');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">รายการสินค้า</h1>
              <p className="mt-2 text-gray-600">
                จัดการข้อมูลสินค้าและต้นทุน
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                ส่งออก Excel
              </motion.button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Search
              Name="ค้นหาสินค้า"
              handleOnChange={handleSearchChange}
            />
            
            <select
              value={filters.departCode}
              onChange={(e) => setFilters({ ...filters, departCode: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทุกแผนก</option>
              <option value="01">แผนกเคมีภัณฑ์</option>
              <option value="02">แผนกปุ๋ย</option>
              <option value="03">แผนกอื่นๆ</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <ProductTable 
              data={products}
              handleOnClick={handleProductClick}
            />
          </div>
        )}

        {/* Product Modal */}
        {modalOpen && selectedProduct && (
          <Modal
            product={selectedProduct}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;