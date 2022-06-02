import NewLoginPage from '../../Components/Input/NewLogin/NewLogin'
import  Styles from  './LoginPage.module.css'
import AuthContext from '../../Store/auth-context';
import Card from '../../Components/UI/Card/Card'
import React,{ useState ,useEffect,useContext} from 'react';

const LoginPage = (props)=>{

    const [isLogin,setLogin] = useState();
    const onCloseHandle = (e)=>{
        // setShow(true);
        authCtx.onShowTab();
    } 
    const authCtx = useContext(AuthContext);
    // console.log(authCtx.isLoggedIn);
    // useEffect(()=>{
    //     onCloseHandle(); 
    // })
    // console.log('clicked');
    

    // <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    //                     <strong className="font-bold">Incorrect Username and Password</strong>
    //                     <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
    //                         <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
    //                     </span>
    //                 </div> 
    
    return (
        <div className = {Styles.background}>
            <Card> 
                <p className= {`${Styles.borderText} text-4xl`}>Login</p>
                {authCtx.isLoggedIn===false&&
                    <div id = "tabIncorrectUser" className={`bg-red-100  border-red-500 rounded-b text-red-900 px-4 py-3 ${Styles.deleteBorder} `} role="alert">
                        <div className="flex">
                            <div className="py-1">
                                <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg>
                            </div>
                            {/* <div className= "flex"> */}
                                <p className=" flex-1 text-m">Incorect Username and Password</p>
                                <div className =" grid">
                                    <svg onClick = {onCloseHandle}  className=" fill-current h-8 w-5 text-red-500 place-self-center " role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                                </div>
                            {/* </div> */}
                        </div>
                    </div>
                }
                <NewLoginPage  />
            </Card>    
        </div>    
    ); 
}
export default LoginPage;