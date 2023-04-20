import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Styles from './PriceList.module.css'
import PriceTable from "../../Components/UI/Table/PriceTable/PriceTable";
import Search from '../../Components/Input/Search/Search'
import Selectbox from '../../Components/Input/SelectBox/Selectbox'
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../Components/Input/Modal/Modal';
import { productActions } from '../../Store/product-slice';
import { reserveActions } from '../../Store/reserve-slice';
import Spreadsheet from '../../Components/Input/SpreadSheet/Spreadsheet'
import { fetchPriceList } from '../../Store/product-list';
import { fetchReserveData } from '../../Store/reserve-list';
import { deleteReserveData } from '../../Store/reserve-list';
import { insertReserveData } from '../../Store/reserve-list';

const PriceList = ()=>{
    const [modalOn,setModalOn] = useState(false);
    const [reserveSection,setReserveSection] = useState(true);
    const [cancelReserveSection,setCancelReserveSection] = useState(false);
    const [reserveValue, setReserveValue] = useState('');
    const [item,setItem] = useState();
    const [data,setData] = useState([]);
    const [error, setError] = useState(null);
    const [value, setvalue] = useState('');
    const [radioValue, setRadiovalue] = useState('');
    const [search,setSearch] = useState('');
    const dispatch = useDispatch();
    let item_value = JSON.parse(sessionStorage.getItem("token"));    
    const isLoading = useSelector((state)=>state.product.isLoading);
    const priceData  = useSelector((state)=>state.product.priceList);
    const optionsList  = useSelector((state)=>state.product.departNameList);
    const reserveList  = useSelector((state)=>state.reserve.data);
    console.log(reserveList);

    const handleOnChange = (e)=>{
        const search = e;
        setSearch(e);
        dispatch(productActions.filterPriceList(search));
    }
    const handleOnClick = (e) =>{
        const items = e.itemcode;
        const Name = e.Name;
        setItem(e);
        setModalOn(true);
    }

    const handleReserveSubmit = (e)=>{
        dispatch(insertReserveData(e,reserveValue,item,item_value.Name));
    }
    const handleReservePrice = (e)=>{
        setReserveValue(e.target.value);
    }

    const handleReserveCancel =(e)=>{
        dispatch(deleteReserveData(e,radioValue));
    }
    const handleRadio = (e)=>{
        console.log(e);
        setRadiovalue(e);
    }

    const reserveSec = ()=>{
        setReserveSection(true);
    }
   const CanclereserveSec = (e,a)=>{
        dispatch(fetchReserveData(e,a));
        setReserveSection(false);
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
                        <label  className="flex items-center pr-2  block font-semibold text-base font-medium text-gray-900 dark:text-gray-400 ">ชื่อการค้า/ชื่อสามัญ</label> 
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
                    <PriceTable handleOnClick = {handleOnClick} data ={priceData} />
                }
                {
                    modalOn&&
                        <Modal item = {item} setModalOn={setModalOn}>
                            <h3 className="mb-4 text-2xl font-medium text-gray-900 dark:text-white">{item.ItemCode} ({item.NameFGS})</h3> 
 
                            <ul className="hidden text-sm font-medium text-center text-gray-500 divide-x divide-gray-200 rounded-lg shadow sm:flex dark:divide-gray-700 dark:text-gray-400">
                                <li className="w-full">
                                    <a onClick = {reserveSec} className="inline-block w-full p-4 text-gray-900 bg-gray-100 rounded-l-lg focus:ring-4 focus:ring-blue-300 active focus:outline-none dark:bg-gray-700 dark:text-white" aria-current="page">จอง</a>
                                </li>
                                <li class="w-full">
                                    <a onClick = {()=>{CanclereserveSec(item,item_value.Name)} } className="inline-block w-full p-4 bg-white hover:text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700">ยกเลิก การจอง</a>
                                </li>
                            </ul> 

                            {    
                                reserveSection == true?
                                <Fragment>
                                    <form  onSubmit = {handleReserveSubmit}>
                                        <table id="dtHorizontalExample" className=" w-full text-base text-left text-gray-500 dark:text-gray-400 mb-5">
                                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" >
                                            <td scope="col" class="px-6 py-4">Sale Name</td>
                                            <td className="px-6 py-4" >{item_value.Name}</td>
                                            </tr> 
                                            <tr  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td scope="col" class="px-6 py-4" >ราคา จอง</td>
                                            <td className="px-6 py-4"><input type="number" id="reservePrice"  onChange = {handleReservePrice} className="bg-green-50 border border-dark-500 text-green-900 dark:text-blue-400 placeholder-blue-700 dark:placeholder-black-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500" placeholder="Reseve Input"/></td>
                                            </tr> 
                                        </table> 
                                            <button type="submit"  className="h-12 text-lg  text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg  mr-10 px-6 py-2.5 text-center ">จอง</button>
                                    </form>    
                                </Fragment>
                                :
                                <Fragment>
                                    <form  onSubmit = {handleReserveCancel}>
                                    <div className={`${Styles.font} relative z-50 overflow-auto shadow-md rounded-lg`}>
                                        <div className= "overflow-scroll  max-h-[500px]">
                                            <table id="dtHorizontalExample" className=" w-full text-base text-left  dark:text-gray-400">
                                                    <thead className={`${Styles.textCustom}  text-white text-base bg-[#FF9E0A]  uppercase whitespace-nowrap sticky top-0 z-[100]`}>
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3">
                                                                
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                ItemCode
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                ItemName
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                Qty
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                Pack
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                SaleCode
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                SaleName
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">
                                                                Date
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                <tbody>
                                                {
                                                    reserveList.map((e)=>{    
                                                        return <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">  
                                                                    <td className="px-6 py-4">
                                                                    <input id="listRadio" type="radio" onClick = {()=>{handleRadio({e})}} value = {e} name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"></input>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {e.itemCode}
                                                                    </td>       
                                                                    <td className="px-6 py-4">
                                                                        {e.itemName}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {e.Qty}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {e.pack}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {e.SaleCode}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {e.SaleName}
                                                                    </td>
                                                                </tr>;     
                                                    })
                                                }            
                                                </tbody>
                                            </table>
                                        </div>  
                                    </div>
                                    <button type="submit" className="h-12 text-lg  text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg mt-5 mr-10 px-6 py-2.5 text-center ">ยกเลิก จอง</button>
                                    </form>
                                </Fragment>
                            }   
                        </Modal>
                }
            </div> 
        </Fragment>
    )
}
export default PriceList;