import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Styles from './ProductList.module.css'
import ProductTable from '../../Components/UI/Table/ProductTable/ProductTable'
import Search from '../../Components/Input/Search/Search'
import Selectbox from '../../Components/Input/SelectBox/Selectbox'
import { useSelector, useDispatch } from 'react-redux';
import { productActions } from '../../Store/product-slice';
import Spreadsheet from '../../Components/Input/SpreadSheet/Spreadsheet'

import { fetchSubData } from '../../Store/product-list';

const ProductList = ()=>{
    const [filterValue,setFilterValue] = useState('');
    const [data,setData] = useState([]);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);


//   useEffect(() => {

//     dispatch(fetchCartData());
//   }, [dispatch]);

    // useEffect(() => {
    //     const getData = async () => {
    //         const res = await fetch('http://192.168.1.40:9001/table');
    //         const actualData = await res.json();
    //         const loadedData = [];
    //         const result = actualData.result.recordsets[0];
    //         for (const key in result){

    //             loadedData.push({
    //                 Name: result[key].Name,
    //                 QBal: result[key].QBal,
    //                 minPrice: result[key].minPrice,
    //                 maxPrice: result[key].maxPrice,
    //                 Barcode:result[key].Barcode,
    //                 TyItemDm:result[key].TyItemDm,
    //                 Bal:result[key].BAL 
    //             })
    //         }
    //         setData(loadedData);
    //         setError(null);
    //     }    
    //     getData()
        
    //   }, []);


    return(
        <Fragment >
            <Navbar/>
            <div className={`${Styles.borderTable}  `}>
                <p className= "text-3xl text-gray-700 font-mono hover:text-blue-600">ทะเบียนผลิตภัณฑ์</p>
                <div className ={`${Styles.search} `}>
                    <div className="flex justify-center">
                         {/* <div class="basis-1/4 pr-4">
                            <Search onChange ={handleOnChange} />
                        </div>   */}
                        {/* <div class="flex justify-center">   */}
                            <Selectbox/>
                        {/* </div>  */}
                    </div>    
                </div>    
                <Spreadsheet/>
                <ProductTable data ={product.filter}/>     
            </div> 
        </Fragment>
    )
}
export default ProductList;