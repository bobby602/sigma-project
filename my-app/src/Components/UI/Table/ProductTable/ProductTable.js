import { Fragment ,useRef,useEffect,useState,useCallback} from 'react'
import axios from "axios";
import Modal from '../../../Input/Modal/Modal'
import Styles from './ProductTable.module.css'



const ProductTable = (data)=>{
    const [modalOn,setModalOn] = useState(false);
  
    const handleOnClick = () =>{
        setModalOn(true);
    }
 
      const dataTable = data.data.map((e)=>{
            return <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">  
                <td class="px-6 py-4">
                    {e.Barcode}
                </td>       
                <td class="px-6 py-4">
                    {e.Name}
                </td>
                <td class="px-6 py-4">
                    {e.QBal}
                </td>
                <td class="px-6 py-4">
                    {e.BAL}
                </td>
                <td class="px-6 py-4">
                    {e.minPrice}
                </td>
                <td class="px-6 py-4">
                    {e.maxPrice}
                </td>
                <td class="px-6 py-4">
                    {e.TyItemDm}
                </td>
                <td class="px-6 py-4 text-right">
                    <a href="#" onClick={handleOnClick} className ="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                </td>
            </tr>
      })
         
    return (
        <Fragment>
            <div className={`${Styles.font} relative overflow-x-auto shadow-md sm:rounded-lg`}>
            <table id="dtHorizontalExample" className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className={`${Styles.textCustom} text-base bg-[#10b981]  uppercase  `}>
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Barcode
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
                        <th scope="col" className="px-6 py-3">
                            ทุน Max
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Type
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {dataTable}
                </tbody>
            </table>
            
        </div>
        {modalOn&&<Modal setModalOn={setModalOn}/>}
      </Fragment>
    )
}
export default ProductTable;