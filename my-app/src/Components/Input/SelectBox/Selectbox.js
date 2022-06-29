import { MultiSelect } from 'primereact/multiselect';
import { Fragment } from 'react';
import {useRef ,useEffect,useState } from 'react'

import  'react-multiple-select-dropdown-lite/dist/index.css'
import  './Selectbox.css'
import { useSelector, useDispatch } from 'react-redux';
import { fetchCartData } from '../../../Store/product-list';
import { Skeleton } from 'primereact/skeleton';

const Selectbox = ()=>{
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);
    const [value, setvalue] = useState('');

    const options =  [{label:'RM' , value: '1'},{label: 'TE', value: '2'},{label: 'SI', value: '3'},{label: 'SF', value: '4'}];
    
        // const handleOnchange = (e)=>{
        //     let test = e;
        //      setvalue(test);
        //     console.log(value);
        //     // dispatch(fetchCartData(value));
        // }  
    useEffect (()=>{
            dispatch(fetchCartData(value));
    },[value])

    return (  
        <Fragment>
            <div className = {`w-100`}>
                <label  className="flex items-center pr-2  block font-semibold text-base font-medium text-gray-900 dark:text-gray-400 ">เลือก Material Type </label> 
                <MultiSelect className = {`test`} value={value} options={options} onChange={(e) =>setvalue(e.value)}  optionLabel="label" placeholder="Select Type" display="chip" />
            </div>
        </Fragment>         
            );
}
export default Selectbox; 