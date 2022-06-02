import { BrowserRouter,Route ,Routes} from 'react-router-dom'
import React,{ useState ,useEffect,useContext} from 'react';
import LoginPage from './Pages/Login/LoginPage';
import MainPage  from './Pages/Main/MainPage';
import UserPage  from './Pages/User/UserPage';
import ProductList  from './Pages/ProductList/ProductList';
import react,{Fragment} from 'react';
import AuthContext from './Store/auth-context';
import { useMediaQuery } from 'react-responsive'


function App() {
  


  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1140px)'
  })
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 849px)' })
  const authCtx = useContext(AuthContext);
  let token = localStorage.getItem('token');
  console.log(authCtx.isLoggedIn);
  let checkpage;
    if( token ||authCtx.isLoggedIn ===true){
      checkpage= <Route path='/MainPage' element={<MainPage />}/>;
      console.log('test');
    }else{
      checkpage = <Route path='/MainPage' element={<LoginPage />}/>;
    }
  
  
  return (
    <Fragment>
        {isDesktopOrLaptop && 
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<LoginPage />} />
              </Routes>
              <Routes >
              {checkpage}
              </Routes>
              <Routes>
                  <Route path="/ProductList" element={<ProductList />} />
              </Routes>
              <Routes>
                  <Route path="/UserPage" element={<UserPage />} />
              </Routes>
          </BrowserRouter> 
        }
        {isTabletOrMobile && 
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<LoginPage />} />
              </Routes>
              <Routes >
                {checkpage}
              </Routes>
              <Routes>
                  <Route path="/ProductList" element={<ProductList />} />
              </Routes>
              <Routes>
                  <Route path="/UserPage" element={<UserPage />} />
              </Routes>
          </BrowserRouter> 
        }
    </Fragment>
  );
}

export default App;

