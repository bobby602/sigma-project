import axiosPrivate from '../Util/useAxiosAPI';

const API = axiosPrivate;

// ============================================
// Fetch Price List with Pagination
// ============================================
export const fetchPriceList = (params = {}) => {
  return async (dispatch) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit || 50);
      if (params.search) queryParams.append('search', params.search);
      if (params.departCode) queryParams.append('departCode', params.departCode);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy || 'ItemCode');
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder || 'ASC');
      
      const queryString = queryParams.toString();
      const url = `/api/prices/list${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching price list from:', url);
      
      dispatch({ type: 'product/setLoading', payload: true });
      
      const res = await API.get(url);
      console.log('✅ Price list response:', res.data);
      
      const priceData = res.data?.data || [];
      const pagination = res.data?.pagination || {
        page: params.page || 1,
        limit: params.limit || 50,
        total: 0,
        totalPages: 1
      };
      
      dispatch({ 
        type: 'product/PriceTable', 
        payload: { 
          priceData,
          pagination 
        }
      });
      
      dispatch({ type: 'product/setLoading', payload: false });
      
      return res.data;
    } catch (error) {
      console.error('❌ Error fetching price list:', error);
      dispatch({ type: 'product/setLoading', payload: false });
      throw error;
    }
  };
};

// ============================================
// Update Price Data (Individual Field)
// ============================================
export const updatePriceData = (data) => {
  return async (dispatch) => {
    try {
      console.log('📝 Updating price data:', data);
      
      const res = await API.put('/api/prices/update', data);
      
      console.log('✅ Price data updated:', res.data);
      
      dispatch({ 
        type: 'product/updatePriceTable', 
        payload: { e: data }
      });
      
      return res.data;
    } catch (error) {
      console.error('❌ Error updating price data:', error);
      throw error;
    }
  };
};

// ============================================
// Update Price List (Bulk with Calculation)
// ============================================
export const updatePriceList = (data) => {
  return async (dispatch) => {
    try {
      console.log('📝 Updating price list:', data);
      
      const res = await API.post('/api/prices/updatePriceList', data);
      
      console.log('✅ Price list updated:', res.data);
      
      const productData = Array.isArray(res?.data?.departData?.recordset)
        ? res.data.departData.recordset
        : (res.data?.data || []);
      
      dispatch({ 
        type: 'product/updatePriceList', 
        payload: { 
          e: data, 
          productData 
        }
      });
      
      return res.data;
    } catch (error) {
      console.error('❌ Error updating price list:', error);
      throw error;
    }
  };
};

// ============================================
// Filter Price by Type (Department)
// ============================================
export const filterPriceType = (types) => {
  return (dispatch) => {
    dispatch({ 
      type: 'product/filterPriceType', 
      payload: types 
    });
  };
};

// ============================================
// Filter Price List (Search)
// ============================================
export const filterPriceList = (searchTerm) => {
  return (dispatch) => {
    dispatch({ 
      type: 'product/filterPriceList', 
      payload: searchTerm 
    });
  };
};

// ============================================
// Clear Price List
// ============================================
export const clearPriceList = () => {
  return (dispatch) => {
    dispatch({ type: 'product/clearPriceList' });
  };
};