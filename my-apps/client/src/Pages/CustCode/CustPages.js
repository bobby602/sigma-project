import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Styles from './CustPages.module.css'
import CustTable from '../../Components/UI/Table/CustTable/CustTable' 
import { Link , useNavigate , useSearchParams   } from 'react-router-dom';
// import Search from '../../Components/Input/Search/Search'
import Selectbox from '../../Components/Input/SelectBox/Selectbox'
import { useSelector, useDispatch } from 'react-redux';
import { user } from '../../Store'
import { fetchPriceList } from '../../Store/product-list';
import Search from "../../Components/Input/Search/Search";
import  { fetchCustomer } from '../../Store/user-list';
import { userList } from '../../Store/userList';
import { searchCustCode } from '../../Store/userList';

const CustPage = ()=>{
    const [data,setData] = useState([]);
    const [error, setError] = useState(null);
    const [value, setvalue] = useState('');
    const [pages,setPages] = useState('year');
    const [search,setSearch] = useState('');
    const [param,setParam] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    let token = sessionStorage.getItem('token2');
    let jsonToken = JSON.parse(token);
    const userCustData  = useSelector((state)=>state.user.custFilterUserData);
    const handleBackOnClick = () =>{
        let date1 = new Date();
        navigate({
            pathname: '/SummaryPages',
            search:`?date1=${searchParams.get("date1")}&date2=${searchParams.get("date2")}`,
        });
    }

    useEffect (()=>{
        dispatch(fetchCustomer(searchParams.get("date1"),searchParams.get("date2"),searchParams.get("custCode")));
    },[])

    
    const handleOnChange = (e)=>{
        dispatch(userList.searchCustCode(e));
    }

    return(
        <Fragment >
            <Navbar/>
            <div className={`${Styles.borderTable}  `}>
            <button type="button" onClick = {handleBackOnClick} className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 mt-4">Back To Previous Page</button>
                <p className= "text-3xl text-gray-700 font-mono hover:text-blue-600">ทะเบียนลูกค้า {searchParams.get("custName")}</p>
                <div className ={`${Styles.search} `}>
                    <h2 className= "text-4xl leading-loose text-center ">{jsonToken.Name} {jsonToken.SurName}</h2>      
                </div> 
                <div className ="flex flex-wrap mb-5">
                    <div className ="">   
                        <span className= "text-2xl text-blue-700 font-mono hover:text-blue-600">ข้อมูล ของ วันที่ {searchParams.get("date1")} - {searchParams.get("date2")}</span>
                    </div>     
                    
                </div>    
                <div className ="px-5">
                        <Search Name = 'ชื่อ' handleOnChange = {handleOnChange} />
                    </div>  
                <CustTable data ={userCustData} />
            </div> 
        </Fragment>
    )
}
export default CustPage;