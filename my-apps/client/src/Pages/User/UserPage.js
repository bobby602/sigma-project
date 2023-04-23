import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import Navbar from "../../Components/UI/Navbar/Navbar";
import { fetchCartData } from '../../Store/product-list';
import Selectbox from '../../Components/Input/SelectBox/Selectbox'
import { useSelector, useDispatch } from 'react-redux';

const UserPage = () =>{
    return(
        <Fragment>
            <Navbar/>
        </Fragment>

    )
}
export default UserPage;