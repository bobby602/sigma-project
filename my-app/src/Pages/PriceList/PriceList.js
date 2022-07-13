import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Styles from './PriceList.module.css'
import PriceTable from "../../Components/UI/Table/PriceTable/PriceTable";
import Search from '../../Components/Input/Search/Search'
import Selectbox from '../../Components/Input/SelectBox/Selectbox'
import { useSelector, useDispatch } from 'react-redux';
import { productActions } from '../../Store/product-slice';
import Spreadsheet from '../../Components/Input/SpreadSheet/Spreadsheet'
import { fetchPriceList } from '../../Store/product-list';

const PriceList = ()=>{
    const [data,setData] = useState([]);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const isLoading = useSelector((state)=>state.product.isLoading)
    const priceData  = useSelector((state)=>state.product.priceList)
    console.log(priceData)

    useEffect (()=>{
        dispatch(fetchPriceList());
    },[])


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
                {
                    isLoading === true
                    ?
                        <section classsName = {`${Styles.priceLoading} `}>
                            <p>Loading...</p> 
                        </section>
                    : 
                    <PriceTable data ={priceData} />
                }     
            </div> 
        </Fragment>
    )
}
export default PriceList;