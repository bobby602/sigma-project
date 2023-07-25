import { Fragment ,useRef,useEffect,useState,useCallback} from 'react'
import Table from '../../../Input/Table/Table';
import Styles from './CustomerTable.module.css';
import Modal from '../../../Input/Modal/Modal';
// import DropDown from '../../../Input/DropDrown/MenuItem';
import { useSelector, useDispatch } from 'react-redux';
import { user } from '../../../../Store'
import { userList } from '../../../../Store/userList'

const CustomerTable = (data)=>{  
  let dataTable = "";
  const [modalOn,setModalOn] = useState(false);
  const [item,setItem] = useState();
  const [numberRow,setNumberRow] = useState('');
  const [itemRowAll,setItemRowAll] = useState();
  const [columnInput,setColumnInput] = useState('');
  const [openInput,setOpenInput] = useState(false);
  const [inputValue,setInputValue] = useState();
  const custDataByCustCode  = useSelector((state)=>state.user.CustRegDataByCustCode); 
  const dispatch = useDispatch();
  let token = sessionStorage.getItem('token');
  let jsonToken = JSON.parse(token);
  console.log(custDataByCustCode)
  const handleOnClick = (e) =>{
    const items = e.Code;
    const Name = e.Name;
    setItem(e);
    console.log(e.Code)
    dispatch(userList.getCustRegByCustCode(items));
    setModalOn(true);
}
console.log(custDataByCustCode.length);
const formatDate = (date)=>{
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [day,month, year].join('/');
}

  if(data.data){
    dataTable = data.data.map((e,index)=>{
        return (
          <tr key={e.number} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600  whitespace-nowrap"> 
           <td  className="px-6 py-4">
              <a onClick={()=>handleOnClick(e)} className ={`grow font-medium  text-blue-600 dark:text-blue-500 hover:underline`}>{e.Code}</a> 
            </td> 
            <td  className="px-6 py-4">
            {e.Name}
            </td>
            <td  className="px-6 py-4">
            {e.Phone}
            </td>  
            <td className="px-6 py-4">
                {e.addr}
            </td>  
            <td  className="px-6 py-4">
              {e.MaxCr}
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
              <th scope="col" className="px-6 py-3">
                    Code
                </th>
                <th scope="col" className="px-6 py-3">
                    Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Phone
                </th>
                <th scope="col" className="sticky left-0 bg-[#AE50FF] px-6 py-3 z-[100]">
                  ที่อยู่ 
                </th>
                <th scope="col" className="px-6 py-3">
                  MaxCr
                </th>
                {/* <th scope="col" className="px-6 py-3">
                ชื่อสามัญ
                </th>
                <th scope="col" className="px-6 py-3">
                ชื่อการค้า
                </th> */}
              </tr> 
            </thead>
            <tbody>
            {dataTable}            
            </tbody>      
          </Table>
          {
                modalOn&&
                    <Modal item = {item} setModalOn={setModalOn}>
                        <h3 className="mb-4 text-2xl font-medium text-gray-900 dark:text-white">{item.Name}</h3>
                            <div className={`${Styles.font2} relative overflow-x-auto shadow-md rounded-lg`}>
                                <div className= "overflow-scroll  max-h-[300px]">
                                    <table id="dtHorizontalExample" className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className={`${Styles.textCustom} text-base bg-[#FF9E0A]  uppercase whitespace-nowrap sticky top-0 z-[100]`}>
                                        {
                                        custDataByCustCode.length == 0 ?
                                        <tr>
                                            <th scope="col" className="text-center px-6 py-3">
                                              ตารางทะเบียน
                                            </th>
                                        </tr>
                                            :
                                            <tr>
                                                <th scope="col" className="px-6 py-3">
                                                    ชื่อสามัญ 
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    ชื่อการค้า
                                                </th>
                                               <th scope="col" className="px-6 py-3">
                                                    เลขทะเบียน
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                  วันหมดอายุ
                                                </th>
                                            </tr>
                                        }
                                        </thead>
                                        
                                        <tbody>
                                        {
                                          custDataByCustCode.length == 0 ?
                                          
                                    <tr>
                                        <td>
                                            <div className="p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                                <img className = {`${Styles.img}`} src = {process.env.PUBLIC_URL + "/icons/folder.png"} alt="My Happy SVG"  width="200" height="300" />
                                                <p className = "text-xl">No Data </p>
                                            </div> 
                                        </td> 
                                    </tr> 
                                      :
                                          custDataByCustCode.map((e)=>{  
                                                return <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">  
                                                            <td className="px-6 py-4">
                                                                {e.ItemName}
                                                            </td>       
                                                            <td className="px-6 py-4">
                                                                {e.ItemNameS}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {e.RegNo}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {formatDate(Date.parse(e.DateExp))}
                                                            </td>
                                                        </tr>;     
                                                        
                                            })
                                        }            
                                        </tbody>
                                    </table>
                                </div>    
                            </div>
                    </Modal>
            }  
            
        </Fragment>
        )
}
export default CustomerTable;