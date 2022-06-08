import { productActions } from './product-slice';
export const fetchCartData = (e) => {

    return async (dispatch) => {
      const fetchData = async () => {
        const res = await fetch('http://192.168.1.40:9001/table');
  
        if (!res.ok) {
          throw new Error('Could not fetch cart data!');
        }
  
        const actualData = await res.json();
        console.log(actualData.result)
  
        return actualData.result;
      };
  
      try {
        const productData = await fetchData();
        console.log(productData);
        dispatch(
            productActions.replaceproduct({productData,e})
        );
      } catch (error) {
        console.log(error);
      }
    };
  };

  export const fetchSubData = (e) => {
    console.log(e)
    return async (dispatch) => {
      const fetchData = async () => {

        const res = await fetch(`http://192.168.1.40:9001/subTable?itemCode=${encodeURIComponent(e)}`);
  
        if (!res.ok) {
          throw new Error('Could not fetch cart data!');
        }
  
        const actualData = await res.json();
  
        return actualData.result.recordset;
      };
  
      try {
        const productData = await fetchData();
        
        dispatch(
            productActions.subTable({productData})
        );
      } catch (error) {
        console.log(error);
      }
    };
  };