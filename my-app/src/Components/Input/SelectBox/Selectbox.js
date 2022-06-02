import Multiselect from 'multiselect-react-dropdown';
import { Fragment } from 'react';
import  './Selectbox.css'
import { useSelector, useDispatch } from 'react-redux';
import { fetchCartData } from '../../../Store/product-list';

const Selectbox = ()=>{
    const options = {
        options: [{name:'EM' , id: '1'},{name: 'TE', id: '2'},{name: 'PO', id: '3'},{name: 'PF', id: '4'}]
    };

    const handleOnChange = (e)=>{
        console.log(e.target.value);
    }

    return (  
        <Fragment>
            <div class="flex flex-col ">
                <label for="countries" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400 text-left">เลือก Type </label>    
                <Multiselect  className = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    options={options.options} // Options to display in the dropdown
                    selectedValues={options.selectedValue} // Preselected value to persist in dropdown
                    displayValue="name"
                    onChange = {handleOnChange}
                    >
                </Multiselect>    
            </div>        
        </Fragment>         
            );
}
export default Selectbox; 