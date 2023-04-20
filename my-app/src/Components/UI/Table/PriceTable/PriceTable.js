import { Fragment ,useRef,useEffect,useState,useCallback} from 'react'
import Table from '../../../Input/Table/Table'
import Styles from './PriceTable.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCheck, faTimes,faBox}from '@fortawesome/free-solid-svg-icons'
import useOutsideClick from '../../../../CustomHook/useOutsideClick';
import { useSelector, useDispatch } from 'react-redux';
import { updatePriceData } from '../../../../Store/product-list';
import { updatePriceList } from '../../../../Store/product-list';

const PriceTable = (data)=>{  
  let dataTable = "";
    const [item,setItem] = useState();
    const [numberRow,setNumberRow] = useState('');
    const [itemRowAll,setItemRowAll] = useState();
    const [columnInput,setColumnInput] = useState('');
    const [openInput,setOpenInput] = useState(false);
    const [inputValue,setInputValue] = useState();
    const dispatch = useDispatch();
    let token = sessionStorage.getItem('token');
    let jsonToken = JSON.parse(token);

    const ref = useOutsideClick(() => {
        setOpenInput(false)
      });
      

    const inputChangeHandel = (e,index,a)=>{
      if(a != ''){
        setColumnInput(a);
        setOpenInput(true);
        setNumberRow(index)
        setItemRowAll(e)
      }
        
    }
      const confirmHandle = (e)=>{
        if(window.confirm("Press a ok button to confirm for update!")){
          if(e.columnInput == 'priceList'){
            dispatch(updatePriceList(e))
            setOpenInput(false)
          }else if (e.columnInput != 'priceList'){
            dispatch(updatePriceData(e))
            setOpenInput(false)
          }
        }

      }
      const cancelHandle = ()=>{
        setOpenInput(false)
      }
      const onChangeHandle = (e) =>{
        setInputValue(e.target.value);
      }

  if(data.data){
    dataTable = data.data.map((e,index)=>{
      if(jsonToken.StAdmin == '1' ){
        return (
          <tr key={e.number} className={` bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600  whitespace-nowrap`}> 
          { e.PackD =='r'?
            <td  className={`bg-[#fbbf24] text-white px-6 py-4`}>
                {e.code}
            </td>  :      
            <td  className={`px-6 py-4`}>  
                {e.code}  
            </td>
          }    
            <td  className=" sticky left-0 z-30 bg-white px-6 py-4 text-center">
                {e.NameFGS}
            </td>
            <td  className="px-6 py-4">
                {e.NameFG}
            </td>
            <td  className="px-6 py-4">
                {e.containProduct}
            </td>
            <td  className="px-6 py-4">
                {e.CU}
            </td>
            <td  className="px-6 py-4 ">
                {e.CP}
            </td>
            <td  className="px-6 py-4">
                {e.COP}
            </td>
            <td  className="px-6 py-4">
              {e.TOT}
            </td>  
            <td  className="px-6 py-4">
                {e.DateAdd}
            </td>
            <td  className="px-6 py-4">
              0.00
            </td>  
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'priceList')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                  <input  type="number" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.priceList} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'priceList')}>{e.priceList}</div>
            }
            </td>  
            <td  className="px-6 py-4">
              {e.datePriceList}
            </td>
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'note')?<div ref = {ref} className = {`${Styles.costInputNote} flex `}>
                                  <input  type="text" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'note')}>{e.NoteF == '' ? '-':e.NoteF}</div>
            }
            </td>
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'price10')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                  <input  type="text" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'price10')}>{e.Price10 == null ? '0':e.Price10}</div>
            }
            </td>
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'AmtF10')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                  <input  type="text" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'AmtF10')}>{e.AmtF10 == '' ? '-':e.AmtF10}</div>
            }
            </td>
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'price25')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                  <input  type="text" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'price25')}>{e.Price25 == null ? '0':e.Price25}</div>
            }
            </td>
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'AmtF25')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                  <input  type="text" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'AmtF25')}>{e.AmtF25 == '' ? '-':e.AmtF25}</div>
            }
            </td>
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'price50')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                  <input  type="text" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'price50')}>{e.Price50 == null ? '0':e.Price50}</div>
            }
            </td>
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'AmtF50')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                  <input  type="text" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'AmtF50')}>{e.AmtF50 == '' ? '-':e.AmtF50}</div>
            }
            </td>
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'price100')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                  <input  type="text" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'price100')}>{e.Price100 == null ? '0':e.Price100}</div>
            }
            </td>
            <td  className="px-6 py-4">
            {
                              (openInput ===true && numberRow == index && columnInput == 'AmtF100')?<div ref = {ref} className = {`${Styles.costInput} flex `}>
                                  <input  type="text" name="floating_company" onChange = {onChangeHandle} id="floating_company" placeholder={e.CostN} className="  block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"  required />
                                  <div className = "flex flex-col pl-2">
                                      <FontAwesomeIcon  onClick = {()=>confirmHandle({inputValue,itemRowAll,columnInput})} className = "pb-2 " icon={faCheck} size="xl" color="green"/>
                                      <FontAwesomeIcon  onClick = {cancelHandle}  icon={faTimes} size="xl"  color="red" />
                                  </div>    
                              </div>
                              :
                              <div className = {`${Styles.cost}`} onClick = {()=>inputChangeHandel(e,index,'AmtF100')}>{e.AmtF100 == '' ? '-':e.AmtF100}</div>
            }
            </td>
        </tr>
        )
      }else if(jsonToken.StAdmin == '3'){
        return(
          <tr key={e.number} className={`${Styles.colOne} bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600  whitespace-nowrap`}> 
            { e.PackD =='r'?
              <td  className={`bg-[#fbbf24] text-white px-6 py-4`}>
                {e.ItemCode}
              </td>  :      
              <td  className={`bg-white px-6 py-4`}>  
                {e.ItemCode}  
              </td>
            }    
            <td className="sticky left-0 bg-white text-blue-600 px-6 py-4 text-right">
                {e.NameFGS}
            </td>
            <td  className="px-6 py-4">
                {e.NameFG}
            </td>
            <td  className=" text-blue-400 px-6 py-4">
                {e.containProduct}
            </td>
            <td  className=" text-red-700 px-6 py-4">
              {e.priceList}
            </td>
            <td  className=" text-orange-500 px-6 py-4">
              {e.Price10 == null ? '0':e.Price10}
            </td>
            <td  className="px-6 py-4">
              {e.AmtF10 == '' ? '-':e.AmtF10}
            </td>
            <td  className="text-amber-400 px-6 py-4">
              {e.Price25 == null ? '0':e.Price25}
            </td>
            <td  className="px-6 py-4">
              {e.AmtF25 == '' ? '-':e.AmtF25}
            </td>
            <td  className="text-lime-500 px-6 py-4">
              {e.Price50 == null ? '0':e.Price50}
            </td>
            <td  className="px-6 py-4">
              {e.AmtF50 == '' ? '-':e.AmtF50}
            </td>
            <td  className="text-green-500 px-6 py-4">
              {e.Price100 == null ? '0':e.Price100}
            </td>
            <td  className="px-6 py-4">
              {e.Amt100 == '' ? '-':e.AmtF100}
            </td>
            <td  className="px-6 py-4">
              {e.name}
            </td>
            <td  className="sticky left-0 z-30 bg-white px-6 py-4">
              <div className = "flex">
                <a onClick={()=>data.handleOnClick(e)} className ={`${Styles.col1} grow font-medium text-blue-600 dark:text-blue-500 hover:underline`}>{e.Reserve}</a>
              </div>    
            </td>
            <td  className="text-teal-500 px-6 py-4">
                {e.bal}
            </td>
            <td  className="px-6 py-4">
              {e.pack == 'L'? 'ลิตร':e.pack == 'KG' ? 'กิโลกรัม' : '-'}
            </td>
            <td  className="px-6 py-4 ">
              {e.NoteF == '' ? '-':e.NoteF}
            </td>
          </tr>   
        )
      } 
  })
  }
   

    return(
        <Fragment>
          <Table>
            <thead className={`${Styles.textCustom} ${Styles.colOne} text-base bg-[#AE50FF]  uppercase whitespace-nowrap sticky top-0 z-[100] `}>
            { jsonToken.StAdmin =='1' ?
              <tr>
                <th scope="col" className=" px-6 py-3 ">
                  รหัสผลิตภัณฑ์
                </th>
                <th scope="col" className={`sticky left-0 bg-[#AE50FF]  px-6 py-3 text-center z-[100] `}>
                  ชื่อการค้า
                </th>
                <th scope="col" className={`px-6 py-3`}>
                  ชื่อผลิตภัณฑ์
                </th>
                <th scope="col" className="px-6 py-3">
                  ขนาดบรรจุ
                </th>
                <th scope="col" className="px-6 py-3">
                  CU
                </th>
                <th scope="col" className="px-6 py-3">
                  CP
                </th>
                <th scope="col" className="px-6 py-3 ">
                  COP
                </th>
                <th scope="col" className="px-6 py-3">
                  TOT
                </th>
                <th scope="col" className="px-6 py-3">
                  วันที่
                </th>
                <th scope="col" className="px-6 py-3">
                  ราคาขาย
                </th>
                <th scope="col" className="px-6 py-3">
                  Price List
                </th>
                <th scope="col" className="px-6 py-3">
                  วันที่
                </th>
                <th scope="col" className="px-6 py-3">
                  ชุดแถม
                </th>
                <th scope="col" className="px-6 py-3">
                  Price 10
                </th>
                <th scope="col" className="px-6 py-3">
                  แถม
                </th>
                <th scope="col" className="px-6 py-3">
                  Price 25
                </th>
                <th scope="col" className="px-6 py-3">
                  แถม
                </th>
                <th scope="col" className="px-6 py-3">
                  Price 50
                </th>
                <th scope="col" className="px-6 py-3">
                  แถม
                </th>
                <th scope="col" className="px-6 py-3">
                  Price 100
                </th>
                <th scope="col" className="px-6 py-3">
                  แถม
                </th> 
              </tr> :
                <tr>
                  <th scope="col" className={` px-6 py-3 `}>
                    รหัสผลิตภัณฑ์
                  </th>
                  <th scope="col" className={`sticky left-0 z-[100] bg-[#AE50FF] px-6 py-3 text-right `}>
                    ชื่อการค้า
                  </th>
                  <th scope="col" className={`px-6 py-3`}>
                    ชื่อผลิตภัณฑ์
                  </th>
                  <th scope="col" className="px-6 py-3">
                    ขนาดบรรจุ
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Price 1
                  </th>          
                  <th scope="col" className="px-6 py-3">
                    Price 10
                  </th>
                  <th scope="col" className="px-6 py-3">
                    แถม
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Price 25
                  </th>
                  <th scope="col" className="px-6 py-3">
                    แถม
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Price 50
                  </th>
                  <th scope="col" className="px-6 py-3">
                    แถม
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Price 100
                  </th>
                  <th scope="col" className="px-6 py-3">
                    แถม
                  </th>
                  <th scope="col" className="px-6 py-3">
                    ซื้อชุดแพ็คกิ้ง
                  </th>
                  <th scope="col" className="px-6 py-3">
                    จอง
                  </th>
                  <th scope="col" className="px-6 py-3">
                    สต๊อกคงเหลือหลังหัก
                  </th>
                  <th scope="col" className="px-6 py-3">
                    หน่วย
                  </th>
                  <th scope="col" className="px-6 py-3">
                    หมายเหตุ
                  </th>
                </tr>  
              }  
            </thead>
            <tbody>{dataTable}</tbody>      
          </Table>
            
        </Fragment>
        )
}
export default PriceTable;