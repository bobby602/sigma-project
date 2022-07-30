import { Fragment ,useRef,useEffect,useState,useCallback,useContext} from 'react'
import axios from "axios";
import Modal from '../../../Input/Modal/Modal'
import Styles from './ProductTable.module.css'
import { Link , useNavigate  } from 'react-router-dom';
import { productActions } from '../../../../Store/product-slice';
import { useSelector, useDispatch } from 'react-redux';
import { updateData } from '../../../../Store/product-list';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCheck, faTimes,faBox}from '@fortawesome/free-solid-svg-icons'
import useOutsideClick from '../../../../CustomHook/useOutsideClick';


const ProductTable = (data)=>{
    const [modalOn,setModalOn] = useState(false);
    const [item,setItem] = useState();
    const [itemRow,setItemRow] = useState('');
    const [itemRowAll,setItemRowAll] = useState();
    const [columnInput,setColumnInput] = useState('');
    const [openInput,setOpenInput] = useState(false);
    const [inputValue,setInputValue] = useState();
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);
    const department = useSelector((state)=> state.product.DepartName);
    const navigate = useNavigate();
    let token = sessionStorage.getItem('token');
    let jsonToken = JSON.parse(token);
    let i = 0 ;
    const ref = useOutsideClick(() => {
        setOpenInput(false)
      });

    const handleOnClick = (e) =>{
        const items = e.itemcode;
        const Name = e.Name;
        setItem(e);
        setModalOn(true);
    }
    const inputChangeHandel = (e,a)=>{
        console.log((e.TyItemDm =='1' || e.TyItemDm =='2') && a == 'cost')
        if((e.TyItemDm =='1' || e.TyItemDm =='2') && a == 'cost' ){
            setOpenInput(true);
            setItemRow(e.itemcode)
            setItemRowAll(e)
            setColumnInput(a);
        }
        else if(a == 'price'){
            setColumnInput(a);
            setOpenInput(true);
            setItemRow(e.itemcode)
            setItemRowAll(e)
        }else if (a == 'priceRe'){
            setColumnInput(a);
            setOpenInput(true);
            setItemRow(e.itemcode)
            setItemRowAll(e)
        }else if (a == 'priceList'){
            setColumnInput(a);
            setOpenInput(true);
            setItemRow(e.itemcode)
            setItemRowAll(e)
        }
    }
      const confirmHandle = (e)=>{
        if(window.confirm("Press a ok button to confirm for update!")){
            dispatch(updateData(e))
            setOpenInput(false)
        }
      }
      const cancelHandle = ()=>{
        setOpenInput(false)
      }
      const onChangeHandle = (e) =>{
        setInputValue(e.target.value);
      }
      let dataTable ='';
      let arrDepart = new Array(department.length); 
        dataTable = data.data.map((e,index)=>{
            if(jsonToken.StAdmin == '1' ){
                return <tr key={e.i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ">  
                    <td   className="px-6 py-4">
                        {e.itemcode}
                    </td> 
                    {e.rowNum == 0 ?  <td  className="bg-[#fbbf24] text-white px-6 py-4">
                                        {e.Name}
                                      </td>  : 
                        <td  className="sticky left-0 z-30 bg-white px-6 py-4">
                            <div className = "flex">
                                <a onClick={()=>handleOnClick(e)} className ={`${Styles.col1} grow font-medium  text-blue-600 dark:text-blue-500 hover:underline`}>{e.Name}</a>
                            </div>    
                        </td>
                    }
                    <td  className="px-6 py-4">
                        {e.Pack}
                    </td>
                    <td  className="px-6 py-4">
                        {e.QBal}
                    </td>
                    <td  className="px-6 py-4">
                        {e.BAL}
                    </td>
                    <td  className="px-6 py-4">
                        {e.minPrice}
                    </td>
                    <td  className="px-6 py-4 ">
                        {e.maxPrice}
                    </td>
                    <td  className="px-6 py-4">
                        {e.TyItemDm}
                    </td>
                    <td  className="px-6 py-4">
                        {e.costNew}
                    </td>
                    <td  className="px-6 py-4">
                        0.00
                    </td>
                    <td className={`px-6 py-4`}>
                    {
                            (openInput ===true && itemRow == e.itemcode && columnInput == 'cost')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                <input  type="number" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                <div className = "flex flex-col pl-2">
                                    <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                    <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                </div>    
                            </div>
                            :
                            <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,'cost')}>{e.CostN}</div>
                        }
                    </td>
                    <td  key = {e.i} className="px-6 py-4">
                        {e.DateCn}
                    </td>
                    <td  className="px-6 py-4">
                    {
                            (openInput ===true && itemRow == e.itemcode && columnInput == 'price')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                <input  type="number" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.price} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                <div className = "flex flex-col pl-2">
                                    <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                    <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                </div>    
                            </div>
                            :
                            <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,'price')}>{e.price}</div>
                        }
                    </td>
                    <td  className="px-6 py-4">
                        {e.datePrice}
                    </td>
                    <td  className="px-6 py-4">
                    {
                            (openInput ===true && itemRow == e.itemcode && columnInput == 'priceRe')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                <input  type="number" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.PriceRE} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                <div className = "flex flex-col pl-2">
                                    <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                    <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                </div>    
                            </div>
                            :
                            <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,'priceRe')}>{e.PriceRE}</div>
                        }
                    </td>
                    <td  className="px-6 py-4">
                        {e.datePriceRe}
                    </td>
                </tr>
            }else if (jsonToken.StAdmin == '2'){
                return (
                        <tr key={e.i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ">  
                            <td   className="px-6 py-4">
                                {e.itemcode}
                            </td>       
                            {e.rowNum == 0 ?  <td  className="bg-[#fbbf24] text-white px-6 py-4">
                                                {e.Name}
                                             </td>  : 
                                <td  className="sticky left-0 z-30 bg-white px-6 py-4">
                                    <div className = "flex">
                                        <a onClick={()=>handleOnClick(e)} className ={`${Styles.col1} grow font-medium  text-blue-600 dark:text-blue-500 hover:underline`}>{e.Name}</a>
                                    </div>    
                                </td>
                            }
                            <td  className="px-6 py-4">
                                {e.QBal}
                            </td>
                            <td  className="px-6 py-4">
                                {e.BAL}
                            </td>
                            <td  className="px-6 py-4">
                                {e.price}
                            </td>
                            <td  className="px-6 py-4">
                                {e.datePrice}
                            </td>
                        </tr>
                    )
            }        
        })
        
      
     let dataTable2 ="";
      if(item){
        dataTable2 = item.NewArr.map((e)=>{    
            return <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">  
                    <td class="px-6 py-4">
                        {e.ItemCode}
                    </td>       
                    <td className="px-6 py-4">
                        {e.ItemName}
                    </td>
                    <td className="px-6 py-4">
                        {e.Qty}
                    </td>
                    <td className="px-6 py-4">
                        {e.Pack}
                    </td>
                    <td className="px-6 py-4">
                        0.00
                    </td>
                </tr>;
        })
    } 
  
    return (
        <Fragment>
            {
            jsonToken.StAdmin =='1'?
                <div className={`${Styles.font} relative z-50 overflow-auto shadow-md rounded-lg`}>
                    <div className= "overflow-scroll  max-h-[1000px]">
                        <table id="dtHorizontalExample" className=" w-full text-base text-left text-gray-500 dark:text-gray-400">
                            <thead className={`${Styles.textCustom} text-base bg-[#10b981] uppercase whitespace-nowrap sticky top-0 z-[100] `}>
                                {
                                data.data.length==0?
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                        ตารางทะเบียนผลิตภัณฑ์
                                        </th>
                                        <th scope="col" className="text-center px-6 py-3">
                                        ตารางทะเบียนผลิตภัณฑ์
                                        </th>
                                    </tr>
                                    :
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            ItemCode
                                        </th>
                                        <th scope="col" className={`sticky left-0 bg-[#10b981] px-6 py-3 z-[100]`}>
                                            ชื่อผลิตภัณฑ์
                                        </th>
                                        <th scope="col" className={`px-6 py-3`}>
                                            หน่วย
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            คงเหลือ
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            หักสถานะค้างต่างๆ
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            ทุน MIN
                                        </th>
                                        <th scope="col" className="px-6 py-3 ">
                                            ทุน Max
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Type
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        ทุนล่าสุด
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        ราคา PO
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        ทุนปรับแต่ง
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        วันที่ปรับแต่ง
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        ราคาขาย
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        วันที่ปรับราคา
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        ราคาขาย RE
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        วันที่ปรับ
                                        </th>
                                    </tr>    
                                }
                            </thead>
                            {
                                data.data.length==0?
                                <tbody>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <div className="p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                                <img className = {`${Styles.img}`}src = {process.env.PUBLIC_URL + "/icons/folder.png"} alt="My Happy SVG"  width="200" height="300" />
                                                <p className = "text-xl">No Data </p>
                                            </div> 
                                        </td> 
                                    </tr> 
                                </tbody>     
                                :
                            <tbody>
                                {dataTable}
                            </tbody>
                            }
                        </table>
                    </div>  
                </div>
                
                :<div className={`${Styles.fontUser} relative z-50 overflow-auto shadow-md rounded-lg`}>
                    <div className= "overflow-scroll  max-h-[1000px]">
                        <table id="dtHorizontalExample" className=" w-full text-base text-left text-gray-500 dark:text-gray-400">
                            <thead className={`${Styles.textCustom} text-base bg-[#10b981]  uppercase whitespace-nowrap sticky top-0 z-[100] `}>
                                {
                                data.data.length==0?
                                    <tr>
                                        <th scope="col" className="text-center px-6 py-3">
                                        ตารางทะเบียนผลิตภัณฑ์
                                        </th>
                                    </tr>
                                    :
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            ItemCode
                                        </th>
                                        <th scope="col" className={`sticky left-0 bg-[#10b981] px-6 py-3 z-[100]`}>
                                            ชื่อผลิตภัณฑ์
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            คงเหลือ
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            หักสถานะค้างต่างๆ
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            ราคาขาย
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            วันที่ปรับราคา
                                        </th>
                                    </tr>    
                                }
                            </thead>
                            {
                                data.data.length==0?
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                                <img className = {`${Styles.img}`}src = {process.env.PUBLIC_URL + "/icons/folder.png"} alt="My Happy SVG"  width="200" height="300" />
                                                <p className = "text-xl">No Data </p>
                                            </div> 
                                        </td> 
                                    </tr> 
                                </tbody>     
                                :
                            <tbody>
                                {dataTable}
                            </tbody>
                            }
                        </table>
                    </div>  
                </div>
            }    
            {
                modalOn&&
                    <Modal item = {item} setModalOn={setModalOn}>
                        <h3 className="mb-4 text-2xl font-medium text-gray-900 dark:text-white">{item.Name}</h3>
                            <div className={`${Styles.font2} relative overflow-x-auto shadow-md rounded-lg`}>
                                <div className= "overflow-scroll  max-h-[300px]">
                                    <table id="dtHorizontalExample" className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className={`${Styles.textCustom} text-base bg-[#FF9E0A]  uppercase whitespace-nowrap sticky top-0 z-[100]`}>
                                            <tr>
                                                <th scope="col" className="px-6 py-3">
                                                    รหัส
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    ชื่อ
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Qty
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    หน่วย
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    ทุน:หน่วย
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    มูลค่า
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            dataTable2 = item.NewArr.map((e)=>{    
                                                return <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">  
                                                            <td className="px-6 py-4">
                                                                {e.ItemCode}
                                                            </td>       
                                                            <td className="px-6 py-4">
                                                                {e.ItemName}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {e.Qty}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {e.Pack}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {e.Cost}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {e.CostN}
                                                            </td>
                                                        </tr>;     
                                            })
                                        }            
                                        </tbody>
                                    </table>
                                </div>    
                            </div>
                            {item.SumArr?
                                <div className="p-6  w-full bg-[#FFCE77] rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                    <div className="grid grid-cols-6 gap-3">
                                        <div className = "p-4 h-3 col-span-2 grid place-content-center bg-white rounded-lg border border-gray-200  shadow-md dark:bg-gray-800 dark:border-gray-700">
                                            <span className={`font-bold ${Styles.text} `}>{item.itemcode}</span>
                                        </div>
                                        <div className = {`col-span-2 col-start-3 content-center grid place-content-end `}>
                                            <span className={` ${Styles.textCustom} text-white text-base  font-bold `}>รวมมูลค่าวัตถุดิบ</span>
                                        </div> 
                                        <div className = "p-4 h-3 col-span-2 col-end-7 content-center  grid place-content-end  bg-white rounded-lg border border-gray-200  shadow-md dark:bg-gray-800 dark:border-gray-700">
                                            <span className=" font-bold   grid place-content-center ">{item.SumArr[0].AmtDM}</span>
                                        </div>   
                                        <div className = {` col-start-4 col-span-2 content-center grid place-content-end `}>
                                            <span className={` ${Styles.textCustom} text-white text-base font-bold `}>ค่าใช้จ่ายต่อหน่วย รวม</span>
                                        </div>   
                                        <div className = "p-4 h-3 col-end-7 col-span-1  content-center  grid place-content-end  bg-white rounded-lg border border-gray-200  shadow-md dark:bg-gray-800 dark:border-gray-700">
                                            <span className=" font-bold  ">{item.SumArr[0].AmtEXP}</span>
                                        </div>
                                        <div className = {` col-start-3 col-span-2 content-center grid place-content-end `}>
                                            <span className={` ${Styles.textCustomAll} text-base font-bold `}>ต้นทุนต่อหน่วย</span>
                                        </div> 
                                        <div className = "p-4 h-3 col-span-2 col-end-7 content-center  grid place-content-end  bg-[#FF5D22] rounded-lg border border-gray-200  shadow-md dark:bg-gray-800 dark:border-gray-700">
                                            <span className=" font-bold  text-white">{item.SumArr[0].AmtCost}</span>
                                        </div>
                                    </div>    
                                </div>    
                                :
                                <div className="p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                    <img className = {`${Styles.img}`}src = {process.env.PUBLIC_URL + "/icons/folder.png"} alt="My Happy SVG"  width="200" height="300" />
                                    <p className = "text-xl">No Data </p>
                                </div>
                        }
                    </Modal>
            }
        </Fragment>
    )
}
export default ProductTable;