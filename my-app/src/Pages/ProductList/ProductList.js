import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Styles from './ProductList.module.css'
import ProductTable from '../../Components/UI/Table/ProductTable/ProductTable'
import Search from '../../Components/Input/Search/Search'
import Selectbox from '../../Components/Input/SelectBox/Selectbox'
import { useSelector, useDispatch } from 'react-redux';
import { productActions } from '../../Store/product-slice';
import Spreadsheet from '../../Components/Input/SpreadSheet/Spreadsheet'
import { MultiSelect } from 'primereact/multiselect';
import { fetchCartData } from '../../Store/product-list'


const ProductList = ()=>{
    const [filterValue,setFilterValue] = useState('');
    const [data,setData] = useState([]);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);
    const [value, setvalue] = useState('');
    const getValue = (e)=>{
        setvalue(e)
    }

    const options =  [{label:'RM' , value: '1'},{label: 'TE', value: '2'},{label: 'SI & SF', value: '3,4'}];
    
    useEffect (()=>{
        dispatch(fetchCartData(value));
    },[value]);

    const handleOnChange = (e)=>{
        const search = e;
        dispatch(productActions.filterProduct(search));
    }

    return(
        <Fragment >
            <Navbar/>
            <div className={`${Styles.borderTable}  `}>
                <p className= "text-3xl text-gray-700 font-mono hover:text-blue-600">ทะเบียนผลิตภัณฑ์</p>
                <div className ={`${Styles.search} `}>
                    <div className ="flex flex-wrap">
                        <div className ="basis-1/4">
                        <Search handleOnChange ={handleOnChange} />
                        </div>
                        <div className="basis-3/4 grid grid-cols-4 gap-3">
                            <div className ="col-start-2 col-span-2  ">
                                <Selectbox options = {options} value = {value} name = 'เลือก Material Type' getValue = {getValue}/>
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