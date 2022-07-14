import react,{Fragment,useContext} from 'react';
import { BrowserRouter,Route ,Routes,Navigate ,Outlet} from 'react-router-dom'
import AuthContext from '../Store/auth-context';
import LoginPage from '../Pages/Login/LoginPage';

const Authorize= (props)=>{
    const authCtx = useContext(AuthContext);
    let token = sessionStorage.getItem('token');
    let jsonToken = JSON.parse(token);
    let checkpage;
    if(jsonToken.StAdmin =='1'){
      checkpage= <Outlet/>;
    }
   else{
      checkpage = <Navigate to ="/ProductList"/>;
    }
    return (
            <Fragment>
                {checkpage}
            </Fragment>
    )
}
export default Authorize;