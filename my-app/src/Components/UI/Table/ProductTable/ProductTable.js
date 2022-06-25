import { Fragment ,useRef,useEffect,useState,useCallback} from 'react'
import axios from "axios";
import Modal from '../../../Input/Modal/Modal'
import Styles from './ProductTable.module.css'
import { Link , useNavigate  } from 'react-router-dom';
import { productActions } from '../../../../Store/product-slice';
import { useSelector, useDispatch } from 'react-redux';
import { updateData } from '../../../../Store/product-list';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCheck, faTimes}from '@fortawesome/free-solid-svg-icons'
import useOutsideClick from '../../../../CustomHook/useOutsideClick'



const ProductTable = (data)=>{
    const [modalOn,setModalOn] = useState(false);
    const [item,setItem] = useState();
    const [itemRow,setItemRow] = useState('');
    const [itemRowAll,setItemRowAll] = useState();
    const [openInput,setOpenInput] = useState(false);
    const [inputValue,setInputValue] = useState();
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);
    const navigate = useNavigate();
    let i = 0 ;
    console.log(product.subTable);

    const ref = useOutsideClick(() => {
        setOpenInput(false)
      });

    const handleOnClick = (e) =>{
        const items = e.itemcode;
        const Name = e.Name;
        console.log(e.NewArr)
        setItem(e);
        setModalOn(true);
    }
    const inputChangeHandel = (e)=>{
        console.log(e)
        if(e.TyItemDm =='1' || e.TyItemDm =='2' ){
            setOpenInput(true);
            setItemRow(e.itemcode)
            setItemRowAll(e)
        }
    }
    const goToPosts = (e) =>
      navigate({
        pathname: `/ProductList/`,
        search:`?test =${e}`
      });
      const confirmHandle = (e)=>{
        if(window.confirm("Press a ok button to confirm for update!")){
            dispatch(updateData(e))
        }
      }
      const cancelHandle = ()=>{
        setOpenInput(false)
      }
      const onChangeHandle = (e) =>{
        setInputValue(e.target.value);
      }
      
    // const onRowExpand = (e)=>{
    //   const item = e.data.itemcode;
    //   const Name = e.data.Name;
    //   goToPosts(item);
    //   dispatch(fetchSubData(item));
    //   setItem(product.subTable);
    // }
      const dataTable = data.data.map((e)=>{
            return <tr key={e.i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ">  
                <td   className="px-6 py-4">
                    {e.itemcode}
                </td>       
                <td  className=" sticky left-0  z-50 bg-white px-6 py-4">
                    <div className = "flex">
                        <a onClick={()=>handleOnClick(e)} className ={`${Styles.col1} grow font-medium  text-blue-600 dark:text-blue-500 hover:underline`}>{e.Name}</a>
                    </div>    
                </td>
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
                        (openInput ===true && itemRow == e.itemcode)?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                            <input  type="number" name="floating_company" onChange = {onChangeHandle} id="floating_company"    value={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="" required />
                            <div className = "flex flex-col pl-2">
                                <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                            </div>    
                        </div>
                        :
                        <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e)}>{e.CostN}</div>
                    }
                </td>
                <td  key = {e.i} className="px-6 py-4">
                    {e.DateCn}
                </td>
            </tr>
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
            <div className={`${Styles.font} relative z-50 overflow-auto shadow-md sm:rounded-lg`}>
                <div className= "overflow-scroll  max-h-[1000px]">
                    <table id="dtHorizontalExample" className=" w-full text-base text-left text-gray-500 dark:text-gray-400">
                        <thead className={`${Styles.textCustom} text-base bg-[#10b981]  uppercase whitespace-nowrap sticky top-0 z-[100] `}>
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
                            </tr>
                        </thead>
                        <tbody>
                            {dataTable}
                        </tbody>
                    </table>
                </div>    
            </div>
            {
                modalOn&&
                    <Modal item = {item} setModalOn={setModalOn}>
                        <h3 className="mb-4 text-2xl font-medium text-gray-900 dark:text-white">{item.Name}</h3>
                        <div className={`${Styles.font} relative overflow-x-auto shadow-md sm:rounded-lg`}>
                            <table id="dtHorizontalExample" className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className={`${Styles.textCustom} text-base bg-[#FF9E0A]  uppercase  `}>
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            ItemCode
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            ชื่อผลิตภัณฑ์
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
                                                        0.00
                                                    </td>
                                                </tr>;
                                    })
                                }            
                                </tbody>
                            </table>
                        </div>
                    </Modal>
            }
        </Fragment>
    )
}
export default ProductTable;