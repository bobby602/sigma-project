import Multiselect from 'multiselect-react-dropdown';
import { Fragment } from 'react';
import {useRef ,useEffect,useState } from 'react'
import MultiSelect from  'react-multiple-select-dropdown-lite'
import  'react-multiple-select-dropdown-lite/dist/index.css'
import  './Selectbox.css'
import { useSelector, useDispatch } from 'react-redux';
import { fetchCartData } from '../../../Store/product-list';

const Selectbox = ()=>{
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);
    const [value, setvalue] = useState('');

    const options =  [{label:'EM' , value: '1'},{label: 'TE', value: '2'},{label: 'PO', value: '3'},{label: 'PF', value: '4'}];
    
        // const handleOnchange = (e)=>{
        //     let test = e;
        //      setvalue(test);
        //     console.log(value);
        //     // dispatch(fetchCartData(value));
        // }  
    useEffect (()=>{
        console.log(value)
            dispatch(fetchCartData(value));
    },[value])

    return (  
        <Fragment>
            <div class="flex flex-col ">
                {/* <label for="countries" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400 text-left">เลือก Type </label>    
                <Multiselect  className = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    options={options} // Options to display in the dropdown // Preselected value to persist in dropdown
                    onChange = {handleOnChange}
                    >
                </Multiselect>  */}

                <div className="app">
                    <div  className="preview-values">
                        <h4>เลือก Type</h4>
                    </div>
                    <MultiSelect
                        onChange= {(e) => setvalue(e)}
                        options={options}
                    />
                </div>   
            </div>        
        </Fragment>         
            );
}
export default Selectbox; 