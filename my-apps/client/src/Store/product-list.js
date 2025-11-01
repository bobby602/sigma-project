import { productActions } from './product-slice';
import axiosPrivate from '../Util/useAxiosAPI';

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

export const fetchCartData = (params) => {
  return async (dispatch) => {
    // ✅ 1. เริ่มต้น - Set loading ก่อนเสมอ
    dispatch(productActions.setLoading(true));
    console.log('🔄 Starting fetch...');

    const fetchData = async () => {
      const normalized = Array.isArray(params?.e)
        ? params.e
        : String(params?.e ?? '').split(',').map(s=>s.trim()).filter(Boolean);

      const payload = {
        e: normalized,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        search: params?.search ?? '',
        sortBy: params?.sortBy ?? 'ItemCode',
        sortOrder: params?.sortOrder ?? 'ASC',
      };

      console.log('📡 Fetching products:', payload);
      
      // ✅ เพิ่ม delay เล็กน้อยเพื่อให้เห็น loading (optional)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const res = await API.post('/api/auth/table', payload);
      
      return {
        rows: pickRows(res),
        pagination: res?.data?.pagination ?? null,
        Data4: res?.data?.Data4 ?? []
      };
    };

    try {
      const { rows, pagination, Data4 } = await fetchData();
      const rowsArr = Array.isArray(rows) ? rows : [];

      console.log('✅ Received data:', {
        rowsCount: rowsArr.length,
        pagination,
        firstItem: rowsArr[0]
      });

      // ✅ 2. Update data
      dispatch(productActions.replaceproduct({
        rows: rowsArr,
        pagination,
        Data4,
        actualData: rowsArr,
        result: { recordset: rowsArr },
        data: rowsArr,
        e: params?.e,
      }));
      
      // ✅ 3. เสร็จแล้ว - ปิด loading
      dispatch(productActions.setLoading(false));
      console.log('✅ Fetch complete!');
      
    } catch (error) {
      console.error('❌ Error fetching cart data:', error);
      
      // ✅ 4. เกิด error - แสดง error และปิด loading
      dispatch(productActions.setError(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'));
      dispatch(productActions.replaceproduct({
        rows: [],
        pagination: null,
        Data4: [],
        actualData: [],
        result: { recordset: [] },
        data: [],
        e: params?.e,
      }));
      
      // ✅ ปิด loading แม้เกิด error
      dispatch(productActions.setLoading(false));
    }
  };
};

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