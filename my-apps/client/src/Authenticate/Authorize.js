import react,{Fragment,useContext} from 'react';
import { BrowserRouter,Route ,Routes,Navigate ,Outlet} from 'react-router-dom'
import AuthContext from '../Store/auth-context';
import LoginPage from '../Pages/Login/LoginPage';

const Authorize= (props)=>{
    const authCtx = useContext(AuthContext);
    let token = sessionStorage.getItem('token');
    let jsonToken = JSON.parse(token);
    console.log(jsonToken)
    let checkpage;
    if(jsonToken.StAdmin =='1'){
      checkpage= <Outlet/>;
    }
    else if(jsonToken.StAdmin =='3'){
      checkpage = <Navigate to ="/PriceLsit"/>;
    }
   else{
      checkpage= <Outlet/>;
      // checkpage = <Navigate to ="/SalesPage"/>;
    }
    return (
            <Fragment>
                {checkpage}
            </Fragment>
    )
}
export default Authorize;