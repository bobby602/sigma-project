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
    const [value, setvalue] = useState('');
    const [search,setSearch] = useState('');
    const dispatch = useDispatch();
    const isLoading = useSelector((state)=>state.product.isLoading)
    const priceData  = useSelector((state)=>state.product.priceList);
    const optionsList  = useSelector((state)=>state.product.departNameList);

    const handleOnChange = (e)=>{
        const search = e;
        setSearch(e);
        dispatch(productActions.filterPriceList(search));
    }
   
    const op = optionsList.map((e)=>{
        return {label:e,value:e};
    })

    const getValue = (e)=>{
        setvalue(e);
        const type = e;
        dispatch(productActions.filterPriceType(type))
    }

    useEffect (()=>{
        dispatch(fetchPriceList());
    },[])


    return(
        <Fragment >
            <Navbar/>
            <div className={`${Styles.borderTable}  `}>
                <p className= "text-3xl text-gray-700 font-mono hover:text-blue-600">ทะเบียนราคาแพ็คกิ้ง</p>
                <div className ={`${Styles.search} `}>
                    <div className ="flex flex-wrap">
                        <div className ="basis-1/4">
                        <Search handleOnChange = {handleOnChange} />
                        </div>
                        <div className="basis-3/4 grid grid-cols-4 gap-3">
                            <div className ="col-start-2 col-span-2  ">
                                <Selectbox options = {op} value = {value} name = 'เลือก ประเภท' getValue = {getValue}/>
                            </div>    
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