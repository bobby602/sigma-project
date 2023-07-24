import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import CardList from "../../Components/UI/CardList/CardList";
// import TabMain from "../components/UI/Tab/TabMain";
import Styles from "./SalesPage.module.css"

const SalesPage = ()=>{

    const MenuName = {menu:["ระบบคำนวณ ราคาขาย",""],link:[["ทะเบียนลูกค้า","/CustomerPage"],["สรุปยอดขาย","/SummaryPages"],["Price List","/ProductList"]]}
    
    return (
            <Fragment>
                <div className={`${Styles.font} `} >
                    <img
                        className={Styles.demo}
                        src={process.env.PUBLIC_URL + "/icons/background-gaf653d700_1280.jpg"}
                        alt=""
                    />  
                    <div className="relative ">
                        <Navbar />
                        <CardList listName ={MenuName}/> 
                    </div>    
                </div>    
            </Fragment>    
    )
}
export default SalesPage;