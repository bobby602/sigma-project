import { Fragment ,useRef,useEffect,useState,useCallback} from 'react'
import Table from '../../../Input/Table/Table'
import Styles from './CustTable.module.css'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import {faCheck, faTimes,faBox}from '@fortawesome/free-solid-svg-icons'
// import useOutsideClick from '../../../../CustomHook/useOutsideClick';
import { useSelector, useDispatch } from 'react-redux';
import { useFetcher } from 'react-router-dom';


const MonthlyTable = (data)=>{  
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
    // console.log(data.data[0])
    const arrData = Object.values(data.data);

  if(data.data){
    dataTable = arrData.map((e,index)=>{
        if(e.DocNo == 'รวม'){
            return (
                <tr key={e.number} className="bg-yellow-200 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600  whitespace-nowrap"> 
                  <td  className="px-6 py-4">
                    {e.DocNo}
                  </td>
                 <td  className="px-6 py-4">
                    {e.ItemName}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.QtySale}
                  </td>
                  <td  className="px-6 py-4">
                  {e.PackSale}
                  </td>
                  <td  className="px-6 py-4">
                  {e.Price}
                  </td>  
                  <td className="px-6 py-4">
                      {e.priceSale}
                  </td>  
                  <td  className="px-6 py-4">
                    {e.Amt}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.Margin}
                  </td> 
              </tr>
            )
        }else{
            return (
                <tr key={e.number} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600  whitespace-nowrap"> 
                <td  className="px-6 py-4">
                    {e.DocNo}
                  </td>
                 <td  className="px-6 py-4">
                    {e.ItemName}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.QtySale}
                  </td>
                  <td  className="px-6 py-4">
                  {e.PackSale}
                  </td>
                  <td  className="px-6 py-4">
                  {e.Price}
                  </td>  
                  <td className="px-6 py-4">
                      {e.priceSale}
                  </td>  
                 
                  <td  className="px-6 py-4">
                    {e.Amt}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.Margin}
                  </td> 
              </tr>
              )
        }  
  })
  }
   
    return(
        <Fragment>
          <Table>
            <thead className={`${Styles.textCustom} text-base bg-cyan-500  uppercase whitespace-nowrap sticky top-0 z-[100] `}>
              <tr>
              <th scope="col" className="px-6 py-3">
                Doc No.
                </th>
                <th scope="col" className="px-6 py-3">
                ItemName
                </th>
                <th scope="col" className="px-6 py-3">
                QtySale
                </th>
                <th scope="col" className="px-6 py-3">
                PackSale
                </th>
                <th scope="col" className="px-6 py-3">
                Price
                </th>
                <th scope="col" className=" px-6 py-3 ">
                priceSale 
                </th>
                <th scope="col" className="px-6 py-3">
                Amt
                </th>
                <th scope="col" className="px-6 py-3">
                Margin
                </th>
              </tr> 
            </thead>
            <tbody>{dataTable}</tbody>      
          </Table>
            
        </Fragment>
        )
}
export default MonthlyTable;