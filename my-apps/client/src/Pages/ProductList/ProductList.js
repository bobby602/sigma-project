import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Styles from './ProductList.module.css'
import ProductTable from '../../Components/UI/Table/ProductTable/ProductTable'
import Search from '../../Components/Input/Search/Search';
import Selectbox from '../../Components/Input/SelectBox/Selectbox';
import Modal from '../../Components/Input/Modal/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { productActions } from '../../Store/product-slice';
import { fetchCartData } from '../../Store/product-list';
import { fetchReserveData } from '../../Store/reserve-list';
import { deleteReserveData } from '../../Store/reserve-list';
import { insertReserveData } from '../../Store/reserve-list';


const ProductList = ()=>{
    const [modalOn,setModalOn] = useState(false);
    const [alert,setAlert] = useState(false);
    const [item,setItem] = useState();
    const [reserveSection,setReserveSection] = useState(true);
    const [cancelReserveSection,setCancelReserveSection] = useState(false);
    const [reserveValue, setReserveValue] = useState('');
    const [filterValue,setFilterValue] = useState('');
    const [data,setData] = useState([]);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);
    const [value, setvalue] = useState('');
    const [radioValue, setRadiovalue] = useState('');
    const reserveList  = useSelector((state)=>state.reserve.data);
    let item_value = JSON.parse(sessionStorage.getItem("token"));   
    
    let reserve = window.sessionStorage.getItem("reserve");
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

    const reserveSec = ()=>{
        setReserveSection(true);
    }
   const CanclereserveSec = (e,a)=>{
        dispatch(fetchReserveData(e,a));
        setReserveSection(false);
   }

   const handleRadio = (e)=>{
        setRadiovalue(e);
    }

   const handleReserveSubmit = (e)=>{
        dispatch(insertReserveData(e,reserveValue,item,item_value.Name,'ProductPage'));
            window.sessionStorage.setItem("reserve", true);
    }
    const handleReservePrice = (e)=>{
        setReserveValue(e.target.value);
    }

    const handleReserveCancel =(e)=>{
        dispatch(deleteReserveData(e,radioValue));
    }

    const handleOnClick = (e) =>{
        const items = e.itemcode;
        const Name = e.Name;
        setItem(e);
        setModalOn(true);
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
                {

                    <div class="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md mb-5" role="alert">
                    <div class="flex">
                      <div class="py-1"><svg class="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
                      <div>
                        <p class="font-bold">Reserved Success</p>
                      </div>
                    </div>
                  </div>
                }
       
                <ProductTable  handleOnClick = {handleOnClick} data ={product.filter}/>     
            </div> 
            {
                    modalOn&&
                        <Modal item = {item} setModalOn={setModalOn}>
                            <h3 className="mb-4 text-2xl font-medium text-gray-900 dark:text-white">{item.ItemCode} ({item.Name})</h3> 
 
                            <ul className="hidden mb-10 text-sm font-medium text-center text-gray-500 divide-x divide-gray-200 rounded-lg shadow sm:flex dark:divide-gray-700 dark:text-gray-400">
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
                                                                    <td className="px-6 py-4">
                                                                        {e.docdateT}
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
        </Fragment>
    )
}
export default ProductList;