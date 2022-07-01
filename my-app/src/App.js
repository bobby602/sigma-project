import { BrowserRouter,Route ,Routes} from 'react-router-dom'
import React,{ useState ,useEffect,useContext} from 'react';
import LoginPage from './Pages/Login/LoginPage';
import MainPage  from './Pages/Main/MainPage';
import UserPage  from './Pages/User/UserPage';
import ProductList  from './Pages/ProductList/ProductList';
import react,{Fragment} from 'react';
import AuthContext from './Store/auth-context';
import { useMediaQuery } from 'react-responsive';
import Auth from './Authenticate/Auth'

function App() {

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1100px)'
  })
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1099px) and (min-width: 200px) ' })
  localStorage.setItem('a', 'test');
 
  return (
    <Fragment>
        {isDesktopOrLaptop && 
          <BrowserRouter>
              <Routes>
                <Route path="/" element={<Auth />} >
                  <Route path='/MainPage' element={<MainPage />}/>
                  <Route path="/ProductList/" element={<ProductList />} />
                  <Route path="/UserPage" element={<UserPage />} />
                </Route>  
                <Route path="/Login" element={<LoginPage />} />
              </Routes>
          </BrowserRouter> 
        }
        {isTabletOrMobile && 
          <BrowserRouter>
              <Routes>
                <Route path="/" element={<Auth />} >
                  <Route path='/MainPage' element={<MainPage />}/>
                  <Route path="/ProductList" element={<ProductList />} />
                  <Route path="/UserPage" element={<UserPage />} />
                </Route>  
                <Route path="/Login" element={<LoginPage />} />
              </Routes>
          </BrowserRouter> 
        }
    </Fragment>
  );
}

export default App;

