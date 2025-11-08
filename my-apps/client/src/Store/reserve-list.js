// Store/reserve-list.js
import { reserveActions } from './reserve-slice';
import API from '../Util/useAxiosAPI';

/**
 * ดึงรายการจอง
 * @param {Object} params - { itemCode, saleName, nameFGS, code }
 */
export const fetchReserveData = (params = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(reserveActions.setLoading(true));
      
      const state = getState();
      
      // ดึงข้อมูลจาก params หรือ state
      const itemCode = params.itemCode || 
                      params.ItemCode || 
                      state.product?.selectedItem?.ItemCode || 
                      state.product?.currentRow?.ItemCode || '';

      const saleName = params.saleName || 
                      params.UserName ||
                      state.user?.userInfo?.name || 
                      state.user?.userInfo?.Name ||
                      state.auth?.user?.name ||
                      state.auth?.user?.Name || '';

      const nameFGS = params.nameFGS || 
                     params.NameFGS || 
                     state.product?.selectedItem?.NameFGS || 
                     state.product?.currentRow?.NameFGS || '';

      const code = params.code || 
                  params.Code ||
                  state.product?.selectedItem?.Code || 
                  state.product?.currentRow?.Code || '';

      console.log('📋 Fetching reserve data with:', { 
        itemCode, 
        saleName, 
        nameFGS, 
        code,
        source: 'fetchReserveData'
      });

      if (!itemCode) {
        console.warn('⚠️ Missing itemCode, cannot fetch reservations');
        dispatch(reserveActions.setError('Missing itemCode'));
        dispatch(reserveActions.setLoading(false));
        return;
      }

      if (!saleName) {
        console.warn('⚠️ Missing saleName, cannot fetch reservations');
        dispatch(reserveActions.setError('Missing saleName'));
        dispatch(reserveActions.setLoading(false));
        return;
      }

      // Build query params - Backend ต้องการ itemCode และ saleName เสมอ
      const queryParams = { 
        itemCode,
        saleName 
      };
      
      // เพิ่ม optional params ถ้ามี
      if (nameFGS) queryParams.nameFGS = nameFGS;
      if (code) queryParams.code = code;

      console.log('🔍 API Request params:', queryParams);

      // เรียก Backend API
      const response = await API.get('api/reservations/list', { 
        params: queryParams 
      });

      console.log('✅ Reserve data fetched:', response.data);

      // Backend ส่ง array มาตรงๆ (ไม่ wrap ใน data object)
      const reservations = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      console.log(`📊 Found ${reservations.length} reservation(s)`);

      dispatch(reserveActions.reserveProduct({ 
        productReserveData: reservations 
      }));
      
      dispatch(reserveActions.setLoading(false));
      
      return reservations;

    } catch (error) {
      console.error('❌ Error fetching reserve data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch reservations';
      dispatch(reserveActions.setError(errorMessage));
      dispatch(reserveActions.setLoading(false));
      throw error;
    }
  };
};

/**
 * สร้างการจอง
 * @param {Object} item - Product item
 * @param {Number} qty - จำนวนที่จอง
 * @param {String} saleName - ชื่อผู้จอง
 */
export const insertReserveData = (item, qty, saleName) => {
  return async (dispatch, getState) => {
    try {
      dispatch(reserveActions.setLoading(true));

      const quantity = Number(qty);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        alert('กรุณาระบุจำนวนที่ถูกต้อง');
        dispatch(reserveActions.setLoading(false));
        return;
      }

      const state = getState();
      const userName = saleName || 
                      state.user?.userInfo?.name || 
                      state.user?.userInfo?.Name ||
                      state.auth?.user?.name ||
                      state.auth?.user?.Name || '';

      if (!userName) {
        alert('ไม่พบข้อมูลผู้ใช้');
        dispatch(reserveActions.setLoading(false));
        return;
      }

      const itemCode = item?.ItemCode || item?.itemCode;
      const nameFGS = item?.NameFGS || item?.nameFGS || '';
      const code = item?.Code || item?.code || '';

      if (!itemCode) {
        alert('ไม่พบรหัสสินค้า');
        dispatch(reserveActions.setLoading(false));
        return;
      }

      console.log('📝 Creating reservation:', {
        itemCode,
        saleName: userName,
        nameFGS,
        code,
        qty: quantity
      });

      // ✅ ตรงกับ Backend: reservations array
      const payload = {
        reservations: [{
          itemCode,
          saleName: userName,  // Backend ใช้ saleName
          nameFGS,
          code,
          qty: quantity,
          note: ''
        }]
      };

      console.log('🚀 API Request payload:', payload);

      const response = await API.post('api/reservations/bulk-create', payload);

      console.log('✅ Reservation created:', response.data);

      alert('จองสินค้าเรียบร้อยแล้ว! 🎉');
      
      // Refresh reserve data
      await dispatch(fetchReserveData({ 
        itemCode, 
        saleName: userName,
        nameFGS,
        code 
      }));

      dispatch(reserveActions.setLoading(false));
      
      return response.data;

    } catch (error) {
      console.error('❌ Error creating reservation:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
      dispatch(reserveActions.setLoading(false));
      throw error;
    }
  };
};

/**
 * ลบการจอง
 * @param {Object} item - Product item (ใช้สำหรับ refresh)
 * @param {Number|String} id - ID ของการจอง
 */
export const deleteReserveData = (item, id) => {
  return async (dispatch, getState) => {
    try {
      dispatch(reserveActions.setLoading(true));

      const reserveId = Number(id);
      if (!Number.isFinite(reserveId) || reserveId <= 0) {
        alert('กรุณาเลือกรายการที่ต้องการยกเลิก');
        dispatch(reserveActions.setLoading(false));
        return;
      }

      console.log('🗑️ Deleting reservation ID:', reserveId);

      const response = await API.delete(`api/reservations/${reserveId}`);

      console.log('✅ Reservation deleted:', response.data);

      alert('ยกเลิกการจองเรียบร้อยแล้ว! ✅');

      // Refresh reserve data
      const state = getState();
      const itemCode = item?.ItemCode || item?.itemCode;
      const userName = state.user?.userInfo?.name || 
                      state.user?.userInfo?.Name ||
                      state.auth?.user?.name ||
                      state.auth?.user?.Name || '';
      const nameFGS = item?.NameFGS || item?.nameFGS || '';
      const code = item?.Code || item?.code || '';

      if (itemCode && userName) {
        await dispatch(fetchReserveData({ 
          itemCode,
          saleName: userName,
          nameFGS,
          code
        }));
      }

      dispatch(reserveActions.setLoading(false));
      
      return response.data;

    } catch (error) {
      console.error('❌ Error deleting reservation:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
      dispatch(reserveActions.setLoading(false));
      throw error;
    }
  };
};