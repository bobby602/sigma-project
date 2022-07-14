import { MultiSelect } from 'primereact/multiselect';
import { Fragment } from 'react';
import {useRef ,useEffect,useState } from 'react'
import  'react-multiple-select-dropdown-lite/dist/index.css'
import  './Selectbox.css'
import { useSelector, useDispatch } from 'react-redux';
import { fetchCartData } from '../../../Store/product-list';
import { Skeleton } from 'primereact/skeleton';

const Selectbox = (props)=>{
    const dispatch = useDispatch();
    const product = useSelector((state) => state.product);

    return (  
        <Fragment>
            <div className = {`w-100`}>
                <label  className="flex items-center pr-2  block font-semibold text-base font-medium text-gray-900 dark:text-gray-400 ">{props.name} </label> 
                <MultiSelect className = {`test`} value={props.value} options={props.options} onChange={(e) =>props.getValue(e.value)}  optionLabel="label" placeholder="Select Type" display="chip" />
            </div>
        </Fragment>         
            );
}
export default Selectbox; 