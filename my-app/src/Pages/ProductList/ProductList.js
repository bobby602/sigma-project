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
                    <div className ="flex flex-wrap">
                        <div className ="basis-1/4">
                        <Search />
                        </div>
                        <div className="basis-3/4 grid grid-cols-4 gap-3">
                            <div className ="col-start-2 col-span-2  ">
                                    <Selectbox/>
                            </div>    
                        </div> 
                    </div>    
                </div>    
                <ProductTable data ={product.filter}/>     
            </div> 
        </Fragment>
    )
}
export default ProductList;