import { Fragment ,useRef,useEffect,useState,useCallback} from 'react';
import Table from '../../../Input/Table/Table'
import Styles from './SummaryTable.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { useFetcher } from 'react-router-dom';


const SummaryTable = (data)=>{  
  let dataTable = "";
    console.log(data)
    const [item,setItem] = useState();
    const [numberRow,setNumberRow] = useState('');
    const [itemRowAll,setItemRowAll] = useState();
    const [columnInput,setColumnInput] = useState('');
    const [openInput,setOpenInput] = useState(false);
    const [inputValue,setInputValue] = useState();
    const dispatch = useDispatch();
    let token = sessionStorage.getItem('token');
    let jsonToken = JSON.parse(token);
    const arrData = Object.values(data.data);
    
  if(data.data){
    dataTable = arrData.map((e,index)=>{
        if(e.CustName == 'รวม'){
            return (
                <tr key={e.number} className="bg-yellow-200 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600  whitespace-nowrap"> 
                  <td  className="px-6 py-4">
                    {e.CustCode}
                  </td>
                 <td  className="px-6 py-4">
                    {e.CustName}
                  </td> 
                  <td  className="px-6 py-4">
                  {e.NetAmt}
                  </td>
                  <td  className="px-6 py-4">
                  {e.Amt}
                  </td>  
                  <td className="px-6 py-4">
                      {e.Cost}
                  </td>  
                  <td  className="px-6 py-4">
                    {e.amtdiff}
                  </td>
                  <td  className="px-6 py-4">
                    {e.Coltd}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.CUMSSP}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.MS}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.Comsale}
                  </td> 
              </tr>
            )
        }else{
            return (
                <tr key={e.number} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600  whitespace-nowrap"> 
                 <td  className="px-6 py-4">
                    <a onClick = {()=>{data.getLink(e.CustCode,e.CustName)}} className = "grow font-medium  text-blue-600 dark:text-blue-500 hover:underline">
                      {e.CustCode}
                    </a>
                  </td>
                 <td  className="px-6 py-4">
                    {e.CustName}
                  </td> 
                  <td  className="px-6 py-4">
                  {e.NetAmt}
                  </td>
                  <td  className="px-6 py-4">
                  {e.Amt}
                  </td>  
                  <td className="px-6 py-4">
                      {e.Cost}
                  </td>  
                  <td  className="px-6 py-4">
                    {e.amtdiff}
                  </td>
                  <td  className="px-6 py-4">
                    {e.Coltd}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.CUMSSP}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.MS}
                  </td> 
                  <td  className="px-6 py-4">
                    {e.Comsale}
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
              CustCode
                </th>
              <th scope="col" className="px-6 py-3">
              CustName
                </th>
                <th scope="col" className="px-6 py-3">
                NetAmt
                </th>
                <th scope="col" className="px-6 py-3">
                Amt
                </th>
                <th scope="col" className=" px-6 py-3 ">
                Cost 
                </th>
                <th scope="col" className="px-6 py-3">
                amtdiff
                </th>
                <th scope="col" className="px-6 py-3">
                Coltd
                </th>
                <th scope="col" className="px-6 py-3">
                CUMSSP
                </th>
                <th scope="col" className="px-6 py-3">
                MS
                </th>
                <th scope="col" className="px-6 py-3">
                Comsale
                </th>
              </tr> 
            </thead>
            <tbody>{dataTable}</tbody>      
          </Table>      
        </Fragment>
        )
}
export default SummaryTable;