import { Fragment ,useRef,useEffect,useState,useCallback} from 'react'
import Table from '../../../Input/Table/Table'
import Styles from './PriceTable.module.css'

const PriceTable = (data)=>{  
  let dataTable = "";
  console.log(data)
  if(data.data){
    dataTable = data.data.map((e)=>{
      return (
        <tr key={e.number} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600  whitespace-nowrap">        
          <td  className="sticky left-0 z-50 bg-white px-6 py-4">  
            {e.code}  
          </td>
          <td  className="px-6 py-4 text-center">
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
      </tr>
      )
  })
  }
   

    return(
        <Fragment>
          <Table>
            <thead className={`${Styles.textCustom} text-base bg-[#AE50FF]  uppercase whitespace-nowrap sticky top-0 z-[100] `}>
              <tr>
                <th scope="col" className="sticky left-0 bg-[#AE50FF] px-6 py-3 z-[100]">
                  รหัสผลิตภัณฑ์
                </th>
                <th scope="col" className={` px-6 py-3 text-center `}>
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
              </tr> 
            </thead>
            <tbody>{dataTable}</tbody>  
          </Table>
        </Fragment>
        )
}
export default PriceTable;