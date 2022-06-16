import Navbar from "../../Components/UI/Navbar/Navbar";
import react,{Fragment,useRef, useEffect,useCallback,useState} from 'react'
import CardList from "../../Components/UI/CardList/CardList";
// import TabMain from "../components/UI/Tab/TabMain";
import Styles from "./MainPage.module.css"

const MainPage = ()=>{
   let token = localStorage.getItem('a');
   console.log(token);
    
    return (
            <Fragment>
                <div className={`${Styles.font} `} >
                    <img
                        className={Styles.demo}
                        src={process.env.PUBLIC_URL + "/icons/S__9453600.jpg"}
                        alt=""
                    />  
                    <div className="relative ">
                        <Navbar />
                        <CardList /> 
                    </div>    
                </div>    
            </Fragment>    
    )
}
export default MainPage;