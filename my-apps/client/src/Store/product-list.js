import { productActions } from './product-slice';
import axiosPrivate from '../Util/useAxiosAPI';

import { createAsyncThunk } from '@reduxjs/toolkit';

const API = axiosPrivate;

/** ดึง rows จาก response */
function pickRows(res) {
  if (!res || !res.data) return [];
  const d = res.data;
  if (Array.isArray(d.data)) return d.data;
  if (Array.isArray(d?.result?.recordset)) return d.result.recordset;
  if (Array.isArray(d.result)) return d.result;
  return [];
}

const groupItemsByDepartment = (items) => {
  if (!items || items.length === 0) return [];
  
  const grouped = [];
  const departments = {};
  
  // Group items by department
  items.forEach(item => {
    const dept = item.DePartName || item.DepartName || 'Unknown';
    if (!departments[dept]) {
      departments[dept] = [];
    }
    departments[dept].push(item);
  });
  
  // Create output with headers
  const sortedDepts = Object.keys(departments).sort();
  
  sortedDepts.forEach(deptName => {
    // Add header row
    grouped.push({
      rowNum: 0,
      Name: deptName,
      DepartName: deptName,
      ItemCode: '',
      isHeader: true, // ← flag สำหรับ UI
      // ฟิลด์อื่นๆ ว่างๆ ตามโครงสร้างเดิม
      codem: '',
      PriceOffer: '',
      Barcode: '',
      Pack: '',
      minPrice: '',
      maxPrice: '',
      TyItemDm: '',
      QBal: '',
      BAL: '',
      CostN: '',
      DateCn: '',
      costNew: '',
      price: '',
      PriceRE: '',
      datePrice: '',
      datePriceRe: '',
      NewArr: [],
      SumArr: [],
      Reserve: ''
    });
    
    // Add items under this department
    departments[deptName].forEach(item => {
      grouped.push({
        ...item,
        isHeader: false
      });
    });
  });
  
  return grouped;
};

export const fetchCartData = createAsyncThunk(
  'product/fetchCartData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.post('/api/auth/table', params);

      // ✅ ดู response ทั้งหมด
      console.log('📡 Full API Response:', response.data);
      console.log('📊 Pagination from API:', response.data?.pagination);

      const items = pickRows(response);
      console.log('🧪 First 3 raw rows:', items.slice(0, 3));
      const groupedItems = groupItemsByDepartment(items)

      console.log('🏷️ Grouped items:', groupedItems);
      console.log('🏷️ First 3 items:', groupedItems.slice(0, 3));
      console.log(`✅ Frontend grouped ${items.length} items into ${groupedItems.length} rows (with headers)`);

      // ✅ ดู payload ก่อน return
      const payload = {
        ...response.data,
        result: groupedItems
      };
      console.log('📦 Payload to Redux:', payload);

      return payload;
      
    } catch (error) {
      console.error('❌ fetchCartData error:', error);
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch data' }
      );
    }
  }
);

export const fetchSubData = (itemCode) => {
  return async (dispatch) => {
    const fetchData = async () => {
      const res = await API.get(`/productList/subTable?itemCode=${encodeURIComponent(itemCode)}`);
      if (res.status !== 200) throw new Error('Could not fetch sub data!');
      return pickRows(res);
    };
    try {
      const productData = await fetchData();
      dispatch(productActions.subTable({ productData }));
    } catch (error) {
      console.error('❌ Error fetching sub data:', error);
    }
  };
};

export const updateData = (data) => {
  return async (dispatch) => {
    const fetchData = async () => {
      const res = await API.put('/productList', data);
      return res.data;
    };
    try {
      console.log('📝 Updating product:', data);
      await fetchData();
      dispatch(productActions.updateTable({ e: data }));
      console.log('✅ Product updated successfully');
    } catch (error) {
      console.error('❌ Error updating data:', error);
    }
  };
};

export const fetchPriceList = () => {
  return async (dispatch) => {
    const fetchData = async () => {
      const res = await API.get('/priceList');
      return pickRows(res);
    };
    try {
      const priceData = await fetchData();
      dispatch(productActions.PriceTable({ priceData }));
    } catch (error) {
      console.error('❌ Error fetching price list:', error);
    }
  };
};

export const updatePriceData = (data) => {
  return async (dispatch) => {
    const fetchData = async () => {
      const res = await API.put('/priceList', data);
      return res.data;
    };
    try {
      await fetchData();
      dispatch(productActions.updatePriceTable({ e: data }));
    } catch (error) {
      console.error('❌ Error updating price data:', error);
    }
  };
};

export const updatePriceList = (data) => {
  return async (dispatch) => {
    const fetchData = async () => {
      const res = await API.post('/priceList/updatePriceList', data);
      const rows =
        Array.isArray(res?.data?.departData?.recordset)
          ? res.data.departData.recordset
          : pickRows(res);
      return rows;
    };
    try {
      const productData = await fetchData();
      dispatch(productActions.updatePriceList({ e: data, productData }));
    } catch (error) {
      console.error('❌ Error updating price list:', error);
    }
  };
};