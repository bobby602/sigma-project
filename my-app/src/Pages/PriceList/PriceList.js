import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Styles from './PriceList.module.css'
// import PriceTable from '../../Components/UI/Table/ProductTable/ProductTable'
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

    return(
        <Fragment >
            <Navbar/>
            <div className={`${Styles.borderTable}  `}>
                <p className= "text-3xl text-gray-700 font-mono hover:text-blue-600">บันทึกต้นทุน ต่างประเทศ</p>
                <div className ={`${Styles.search} `}>
                    <div className ="flex flex-wrap">
                        <div className ="basis-1/4">
                        <Search />
                        </div>
                    </div>    
                </div>    
                {/* <ProductTable data ={product.filter}/>      */}
            </div> 
        </Fragment>
    )
}
export default ProductList;