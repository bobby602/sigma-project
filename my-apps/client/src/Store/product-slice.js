import { createSlice } from '@reduxjs/toolkit';
import { fetchCartData } from './product-list';

/* ===== Helpers ===== */
const asArray = (v) => (Array.isArray(v) ? v : []);
const toLower = (v) => String(v ?? '').toLowerCase();

const productSlice = createSlice({
  name: 'product',
  initialState: {
    rows: [],
    pagination: null,
    Data4: [],
    data: [],
    filter: [],
    actualData: [],
    result: { recordset: [] },
    isLoading: false,
    error: null,
    subTable: [],
    priceList: [],
    departNameList: [],
    type: [],
    DepartName: [],
    e: [],
  },
  
  reducers: {
    replaceproduct(state, action) {
      console.log('🔄 Redux replaceproduct:', action.payload);
      
      const { rows, pagination, Data4, actualData, result, data, e } = action.payload;
      const rowsArr = asArray(rows);
      console.log('📦 Rows to update:', rowsArr.length);
      
      state.rows = rowsArr;
      state.pagination = pagination;
      state.Data4 = Data4 || [];
      state.e = e || [];
      state.data = rowsArr;
      state.filter = rowsArr;
      state.actualData = actualData || rowsArr;
      state.result = result || { recordset: rowsArr };
      state.isLoading = false;
      state.error = null;
      
      console.log('✅ Redux updated, rows length:', state.rows.length);
    },

    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearProducts(state) {
      state.rows = [];
      state.filter = [];
      state.data = [];
      state.pagination = null;
    },

    filterProduct(state, action) {
      const searchTerm = action.payload;
      
      if (Array.isArray(searchTerm)) {
        return;
      }
      
      const search = toLower(searchTerm);
      
      if (!search || search.trim() === '') {
        state.filter = state.rows;
      } else {
        state.filter = state.rows.filter((e) => {
          const name = toLower(e?.Name || '');
          const itemCode = toLower(e?.ItemCode || '');
          const barcode = toLower(e?.Barcode || '');
          const departName = toLower(e?.DepartName || '');
          
          return (
            name.includes(search) ||
            itemCode.includes(search) ||
            barcode.includes(search) ||
            departName.includes(search)
          );
        });
      }
      
      console.log('🔍 Filtered results:', state.filter.length);
    },

    subTable(state, action) {
      state.subTable = asArray(action.payload?.productData);
    },

    updateTable(state, action) {
      let value = action.payload.e.inputValue;
      const item = action.payload.e.itemRowAll;
      const type = action.payload.e.columnInput;
      
      let today = new Date();
      let yyyy = today.getFullYear();
      let mm = today.getMonth() + 1;
      let dd = today.getDate();
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      today = dd + '/' + mm + '/' + yyyy;
      
      if (value != null) {
        value = Number(value);
        value = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        value = '0.00';
      }
      
      state.rows = state.rows.map((e) => {
        if (e.ItemCode == item.ItemCode || e.itemcode == item.itemcode) {
          let returnValue = { ...e };
          
          if (type == 'cost') {
            returnValue.CostN = value;
            returnValue.DateCn = today;
          } else if (type == 'price') {
            returnValue.price = value;
            returnValue.datePrice = today;
          } else if (type == 'priceRe') {
            returnValue.PriceRE = value;
            returnValue.datePriceRe = today;
          }
          
          return returnValue;
        }
        return e;
      });
      
      state.filter = state.rows;
      state.data = state.rows;
    },

    filterPriceList(state, action) {
      const Item = action.payload;
      state.priceList = state.data.filter((e) => {
        const n1 = toLower(e?.NameFGS);
        const n2 = toLower(e?.NameFG);
        if (n1.includes(toLower(Item)) || n2.includes(toLower(Item))) {
          return true;
        }
        return false;
      });
    },

    filterPriceType(state, action) {
      const type = action.payload;
      let Str = '';
      let i = 0;
      
      if (type) {
        type.forEach((e) => {
          Str = Str + e + ',';
          i++;
        });
        Str = Str.substring(0, Str.length - 1);
        state.type = Str;
      }
      
      if (type.length != 0) {
        state.priceList = state.data.filter((e) => {
          if (type.includes(e.DepartName)) {
            return true;
          }
          return false;
        });
      } else {
        state.priceList = state.data;
      }
    },

    PriceTable(state, action) {
      const distinct = (value, index, self) => {
        return self.indexOf(value) === index;
      };
      
      const Item = action.payload;
      let count;
      
      let departName = asArray(Item.priceData).map((e, index) => {
        count = index;
        return e.DepartName;
      });
      
      let test = departName.filter(distinct);
      state.departNameList = test;
      
      let priceArr = [];
      test.forEach((e, index) => {
        priceArr.push({
          AmtF10: '',
          AmtF25: '',
          AmtF50: '',
          AmtF100: '',
          COP: '',
          CP: '',
          CU: '',
          DateAdd: '',
          DepartCpde: '',
          DepartName: e,
          ItemCode: e,
          NameFG: '',
          NameFGS: '',
          Reserve: '',
          NoteF: '',
          PackD: 'r',
          PackR: '',
          PackSale: '',
          Price10: '',
          Price25: '',
          Price50: '',
          Price100: '',
          RPackRpt: '',
          Rpack: '',
          RpackSale: '',
          TOT: '',
          code: e,
          containProduct: '',
          datePriceList: '',
          name: '',
          number: String(count + index + 2),
          priceList: '',
        });
      });
      
      asArray(Item.priceData).forEach((e) => {
        priceArr.push(e);
      });
      
      let priceArrSort = [];
      let map1 = new Map();
      
      for (let j = 0; j < test.length; j++) {
        let varChange = test[j];
        for (let i = 0; i < priceArr.length; i++) {
          if (varChange == priceArr[i].DepartName) {
            map1.set(priceArr[i], i);
          }
        }
      }
      
      let countNum = 0;
      Array.from(map1, ([key, value]) => {
        priceArrSort[countNum] = key;
        countNum++;
      });
      
      state.priceList = priceArrSort;
      state.data = state.priceList;
    },

    updatePriceTable(state, action) {
      let value = action.payload.e.inputValue;
      const item = action.payload.e.itemRowAll;
      const type = action.payload.e.columnInput;
      
      let today = new Date();
      let yyyy = today.getFullYear();
      let mm = today.getMonth() + 1;
      let dd = today.getDate();
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      today = dd + '/' + mm + '/' + yyyy;
      
      if (value != null) {
        value = Number(value);
        value = value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        value = '0.00';
      }
      
      state.priceList = state.priceList.map((e) => {
        if (
          e.ItemCode == item.ItemCode &&
          e.code == item.code &&
          e.NameFGS == item.NameFGS
        ) {
          let returnValue = { ...e };
          
          if (type == 'note') returnValue.NoteF = value;
          else if (type == 'price10') returnValue.Price10 = value;
          else if (type == 'AmtF10') returnValue.AmtF10 = value;
          else if (type == 'price25') returnValue.Price25 = value;
          else if (type == 'AmtF25') returnValue.AmtF25 = value;
          else if (type == 'price50') returnValue.Price50 = value;
          else if (type == 'AmtF50') returnValue.AmtF50 = value;
          else if (type == 'price100') returnValue.Price100 = value;
          else if (type == 'AmtF100') returnValue.AmtF100 = value;
          
          return returnValue;
        }
        return e;
      });
    },

    updatePriceList(state, action) {
      const departGroup = action.payload.productData[0];
      let value = action.payload.e.inputValue;
      const item = action.payload.e.itemRowAll;
      const type = action.payload.e.columnInput;
      
      let today = new Date();
      let yyyy = today.getFullYear();
      let mm = today.getMonth() + 1;
      let dd = today.getDate();
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      today = dd + '/' + mm + '/' + yyyy;
      
      if (value != null) {
        value = Number(value);
        value = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        value = '0.00';
      }
      
      state.priceList = state.priceList.map((e) => {
        if (
          e.ItemCode == item.ItemCode &&
          type == 'priceList' &&
          e.code == item.code &&
          e.NameFGS == item.NameFGS
        ) {
          let returnValue = { ...e };
          returnValue.priceList = value;
          returnValue.datePriceList = today;
          returnValue.Price10 = value - (value * departGroup.Disc10) / 100;
          returnValue.Price25 = value - (value * departGroup.Disc25) / 100;
          returnValue.Price50 = value - (value * departGroup.Disc50) / 100;
          returnValue.Price100 = value - (value * departGroup.Disc100) / 100;
          returnValue.AmtF10 = departGroup.AmtF10;
          returnValue.AmtF25 = departGroup.AmtF25;
          returnValue.AmtF50 = departGroup.AmtF50;
          returnValue.AmtF100 = departGroup.AmtF100;
          return returnValue;
        }
        return e;
      });
    },
  }, // ← ปิด reducers ตรงนี้

  // ✅ extraReducers ต้องอยู่นอก reducers!
  extraReducers: (builder) => {
    console.log('🔧 extraReducers is being configured');
    
    builder
      .addCase(fetchCartData.pending, (state) => {
        console.log('⏳ fetchCartData.pending - START');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartData.fulfilled, (state, action) => {
        console.log('✅ fetchCartData.fulfilled - START');
        console.log('📦 Payload received:', action.payload);
        
        const { result, pagination, Data4 } = action.payload;
        const rowsArr = Array.isArray(result) ? result : [];
        
        console.log('📊 Processing:', {
          resultLength: rowsArr.length,
          pagination: pagination,
          Data4Length: Data4?.length
        });
        
        state.rows = rowsArr;
        state.data = rowsArr;
        state.filter = rowsArr;
        state.actualData = rowsArr;
        state.result = { recordset: rowsArr };
        state.pagination = pagination || null;
        state.Data4 = Data4 || [];
        state.isLoading = false;
        state.error = null;
        
        console.log('✅ Redux state updated:', {
          rowsLength: state.rows.length,
          pagination: state.pagination
        });
      })
      .addCase(fetchCartData.rejected, (state, action) => {
        console.error('❌ fetchCartData.rejected');
        console.error('Error:', action.payload);
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch data';
      });
  },
});

export const productActions = productSlice.actions;
export default productSlice;
