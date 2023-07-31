import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Styles from './CustomerPage.module.css'
import CustomerList from '../../Components/UI/Table/CustomerLIst/CustomerTable'
import { useSelector, useDispatch } from 'react-redux';
import { user } from '../../Store'
import  { fetchData } from '../../Store/user-list'
import  { searchCustomer } from '../../Store/user-list'
import { userList } from '../../Store/userList'
import Search from "../../Components/Input/Search/Search";

const CustomerPage= ()=>{
    const [data,setData] = useState([]);
    const [error, setError] = useState(null);
    const [value, setvalue] = useState('');
    const [search,setSearch] = useState('');
    const dispatch = useDispatch();
    // const isLoading = useSelector((state)=>state.product.isLoading)
    const userData  = useSelector((state)=>state.user.filterData);
    const handleOnChange = (e,name)=>{
        const search = e;
    if(name =='ชื่อยาสามัญ และ ชื่อยาการค้า'){
        console.log('etst')
      dispatch(userList.searchCustomer(search));  
    }else{
        dispatch(userList.searchCustomerName(search));
    }
  }

    useEffect (()=>{
        dispatch(fetchData());
        dispatch(searchCustomer());
    },[])


    return(
        <Fragment >
            <Navbar/>
            <div className={`${Styles.borderTable}  `}>
                <p className= "text-3xl text-gray-700 font-mono hover:text-blue-600">ทะเบียนลูกค้า</p>
                <div className ={`${Styles.search} flex `}>
                    <div className = "mr-20 pr-20">
                        <Search Name = 'ชื่อลูกค้า' handleOnChange = {handleOnChange} />
                    </div>
                    <div className = "ml-10 pr-5">
                        <Search Name = 'ชื่อยาสามัญ และ ชื่อยาการค้า' handleOnChange = {handleOnChange} />
                    </div>
                </div>    
                <CustomerList data ={userData} />
            </div>
        </Fragment>
    )
}
export default CustomerPage;