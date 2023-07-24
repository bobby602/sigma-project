import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react';
import Styles from './SummaryPages.module.css';
import SummaryTable from '../../Components/UI/Table/SummarySales/SummaryTable'; 
import { Link , useNavigate ,useSearchParams } from 'react-router-dom';
import Selectbox from '../../Components/Input/SelectBox/Selectbox';
import { useSelector, useDispatch } from 'react-redux';
import  { fetchSummaryUserbyDate  } from '../../Store/user-list';
import Search from "../../Components/Input/Search/Search";
import { userList } from '../../Store/userList';

const SummaryPage = ()=>{

    const [data,setData] = useState([]);
    const [input,setInput] = useState({
        date1Val:'',
        date2Val:''
    });
    const [showValue,setShowValue] = useState(false);
    let token = sessionStorage.getItem('token');
    let jsonToken = JSON.parse(token);
    const [error, setError] = useState(null);
    const [value, setvalue] = useState('');
    const [search,setSearch] = useState('');
    const [cust,setCust] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    let date1 = new Date();

    //  const goToPosts = (e) =>
    //   navigate({
    //     pathname: '/MonthlyPage',
    //     search:`?month=${e}`,
    //   });

    //   const goToCust = (value,e,a,year) =>
    //   console.log(e);
    //   navigate({
    //     pathname: '/CustPage',
    //     search:`?custCode=${e}&month=${value}&custName=${a}&year=${year}&pages=month`,
    //   });

    // const isLoading = useSelector((state)=>state.product.isLoading)
    const userSummaryData  = useSelector((state)=>state.user.summaryuserData);

    const optionList =  [{label:'มกราคม',value:'01'},{label:'กุมภาพันธ์',value:'02'},{label:'มีนาคม',value:'03'},{label:'เมษายน',value:'04'},
    {label:'พฤษภาคม',value:'05'},{label:'มิถุนายน',value:'06'},{label:'กรกฎาคม',value:'07'},{label:'สิงหาคม',value:'08'},{label:'กันยายน',value:'09'},{label:'ตุลาคม',value:'10'},
    {label:'พฤศจิกายน',value:'11'},{label:'ธันวาคม',value:'12'}];

    const submitHandler = (e) => { 
        e.preventDefault();
        const re = /\d{2}(\/)\d{2}(\/)\d{4}/;
        const pass = false;
        if(re.exec(input.date1Val)!= null && re.exec(input.date2Val)!= null ){
            setShowValue(true);
            dispatch(fetchSummaryUserbyDate(input,jsonToken.SaleCode));
        }else{
            alert("Invalid date Format ! \n Please enter the date in the format dd/MM/YYYY")
        }
       
    }

    const date1Input = (e)=>{
        setInput({
            ...input,
            date1Val:e.target.value
        })    
    }

    const date2Input = (e)=>{
        setInput({
            ...input,
            date2Val:e.target.value
        })    
    }

    const handleOnChange = (e)=>{
        
          dispatch(userList.SearchSummaryUser(e));  
        
      }

    return(
        <Fragment >
            <Navbar/>
            <div className={`${Styles.borderTable}  `}>
            <button type="button" className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 mt-4">Back to Main Page</button>
                <p className= "text-3xl text-gray-700 font-mono hover:text-blue-600">สรุปยอดขาย</p>
                    <form className ={`${Styles.searchDate}`} onSubmit={submitHandler} >
                        <div className = "flex px-4 mt-10 justify-center">
                            <div className="content-center mt-8 px-3">
                                <input type="text" id="date1" maxlength="10" onChange = {date1Input} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  required/>
                            </div>
                            <div className="content-center mt-3">
                                <p className= "text-3xl text-gray-700 font-mono hover:text-blue-600"> - </p>
                            </div>
                            <div className=" content-center mt-8 px-4">
                                <input type="text" id="date2" maxlength="10" onChange = {date2Input} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  required/>
                            </div>
                            <div className=" mt-8">
                                <button  type="submit" className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2">Search</button>
                            </div>

                        </div>
                    </form>
                    <div className ="px-10">
                        <Search Name = 'ชื่อ' handleOnChange = {handleOnChange} />
                    </div> 
                {
                /* {
                    <div className="grid grid-cols-3 gap-2 w-25 justify-items-center  mt-8">
                        <div className="col-start-1 col-end-3 justify-items-center">
                            <span className= "text-2xl text-red-700 font-mono hover:text-red-600">Invalid date Format !</span>
                        </div>
                        <div className="col-start-1 col-end-3">
                        <span className= " text-l text-red-600 font-mono hover:text-red-600">Please enter the date in the format "dd/MM/YYYY"</span>
                        </div>
                    </div>
                }           */
                }
                <div className ={`${Styles.search} `}>
                </div> 
                <div className ="flex flex-wrap mb-5">
                    <div className ="basis-2/4 ">  
                        {
                            showValue?
                            <div className="ml-10">
                                <div className="">
                                    <span className= "text-2xl text-blue-700 font-mono hover:text-blue-600">ข้อมูล ของ วันที่ {input.date1Val} - {input.date2Val}</span>
                                </div>
                            </div>
                            :
                            <div className="ml-10"><span className= "text-2xl text-red-700 font-mono hover:text-red-600">No data Please Select Date !!</span></div>
                        } 
                    </div>     
                </div>     
                <SummaryTable data ={userSummaryData}  />
            </div> 
        </Fragment>
    )
}
export default SummaryPage;