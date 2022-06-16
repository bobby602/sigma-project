import { Fragment ,useRef,useEffect,useState,useCallback} from 'react'
import axios from "axios";
import Modal from '../../../Input/Modal/Modal'
import Styles from './ProductTable.module.css'
import { Link , useNavigate  } from 'react-router-dom';
import { productActions } from '../../../../Store/product-slice';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSubData } from '../../../../Store/product-list';

const ProductTable = (data)=>{
    const [modalOn,setModalOn] = useState(false);
    const [item,setItem] = useState();
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);
    const navigate = useNavigate();
    console.log(product.subTable);


    const handleOnClick = (e) =>{
        const items = e.itemcode;
        const Name = e.Name;
        console.log(e.NewArr)
        setItem(e);
        setModalOn(true);
    }
      const dataTable = data.data.map((e)=>{
            return <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">  
                <td class="px-6 py-4">
                    {e.itemcode}
                </td>       
                <td class="px-6 py-4">
                <a  onClick={()=>handleOnClick(e)} className ="font-medium text-blue-600 dark:text-blue-500 hover:underline">{e.Name}</a>
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
            </tr>
      })
         
    return (
        <Fragment>
            <div className={`${Styles.font} relative overflow-x-auto shadow-md sm:rounded-lg`}>
            <table id="dtHorizontalExample" className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className={`${Styles.textCustom} text-base bg-[#10b981]  uppercase  `}>
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
        {modalOn&&<Modal item = {item} setModalOn={setModalOn}/>}
      </Fragment>
    )
}
export default ProductTable;