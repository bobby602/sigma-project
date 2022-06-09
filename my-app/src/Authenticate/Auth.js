import react,{Fragment,useContext} from 'react';
import { BrowserRouter,Route ,Routes,Navigate ,Outlet} from 'react-router-dom'
import AuthContext from '../Store/auth-context';
import LoginPage from '../Pages/Login/LoginPage';

const Auth = (props)=>{
    const authCtx = useContext(AuthContext);
    let token = sessionStorage.getItem('token');
    console.log(token)
    let checkpage;
    if( token ||authCtx.isLoggedIn ===true){
      checkpage= <Outlet/>;
    }else{
      checkpage = <Navigate to ="/Login"/>;
    }

    console.log(props)
    return (
            <Fragment>
                {checkpage}
            </Fragment>
    )
}
export default Auth;