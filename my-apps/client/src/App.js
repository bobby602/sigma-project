import { BrowserRouter,Route ,Routes} from 'react-router-dom'
import React,{ useState ,useEffect,useContext} from 'react';
import LoginPage from './Pages/Login/LoginPage';
import MainPage  from './Pages/Main/MainPage';
import UserPage  from './Pages/User/UserPage';
import ProductList  from './Pages/ProductList/ProductList';
import PriceList  from './Pages/PriceList/PriceList';
import react,{Fragment} from 'react';
import { useMediaQuery } from 'react-responsive';
import Auth from './Authenticate/Auth'
import Authorize from './Authenticate/Authorize'

function App() {

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1100px)'
  })
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1099px) and (min-width: 200px) ' })
 
  return (
    <Fragment>
        {isDesktopOrLaptop && 
          <BrowserRouter>
              <Routes>
                <Route path="/" element={<Auth />} >
                  {/* public route*/}
                    <Route path="/ProductList" element={<ProductList />} />

                  {/* public route*/}
                  <Route path="/PriceList" element={<PriceList />} />

                  {/* private route*/}
                  <Route element={<Authorize />}>
                    <Route path="/MainPage" element={<MainPage />} />
                    <Route path="/ProductList" element={<ProductList />} />
                    <Route path="/PriceList" element={<PriceList />} />
                    <Route path="/UserPage" element={<UserPage />} />
                    <Route path="/ProductList" element={<ProductList />} />
                  </Route>  
                </Route>  
                <Route path="/Login" element={<LoginPage />} />
              </Routes>
          </BrowserRouter> 
        }
        {isTabletOrMobile && 
          <BrowserRouter>
              <Routes>
                <Route path="/" element={<Auth />} >
                  {/* public route*/}
                  <Route path="/ProductList" element={<ProductList />} />

                  {/* public route*/}
                  <Route path="/PriceList" element={<PriceList />} />

                  {/* private route*/}
                  <Route element={<Authorize />}>
                    <Route path="/MainPage" element={<MainPage />} />
                    <Route path="/ProductList" element={<ProductList />} />
                    <Route path="/PriceList" element={<PriceList />} />
                    <Route path="/UserPage" element={<UserPage />} />
                    <Route path="/ProductList" element={<ProductList />} />
                  </Route>  
                </Route>  
                <Route path="/Login" element={<LoginPage />} />
              </Routes>
          </BrowserRouter> 
        }
    </Fragment>
  );
}

export default App;

