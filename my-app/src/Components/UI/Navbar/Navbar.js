import { Fragment ,useRef,useEffect,useState,useCallback,useContext} from 'react'
import styles from './Navbar.module.css'
import { menuItems } from "./MenuItem/MenuItems";
import { Link , useNavigate  } from 'react-router-dom'
// import MenuItems from "./MenuItem/MenuItems";
import AuthContext from '../../../Store/auth-context';

const Navbar = ()=>{
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext); 
  const handelOnClick = ()=>{
    authCtx.onLogOut();
    navigate("/Login");
  }
  // const ref = useRef(null);
  // const [y, setY] = useState(window.scrollY);
  // const [height, setHeight] = useState(0);
  //  const handleNavigation = useCallback(
  //   (e) => {

  //     const window = e.currentTarget;
  //     if (y > 50) {
  //       console.log(ref.current); 
  //       // setHeight(ref.current.clientHeight)
  //       console.log("scrolling up");
  //     } else {
  //       console.log("scrolling down");
  //     }
  //     setY(window.scrollY);
  //   },
  //   [y]
  // );
  //   const getHeight = ()=>{
  //     setHeight(ref.current.offsetHeight);
  //   }
  //   useEffect(() => {
  //   window.addEventListener("scroll", (e) => handleNavigation(e));

  //   return () => { // return a cleanup function to unregister our function since its gonna run multiple times
  //       window.removeEventListener("scroll", (e) => handleNavigation(e));
  //   };
  //   }, [y]);
  // useEffect(() => {
  //       // console.log(height);
  //       getHeight();
  //       console.log(height);
  // },[y]);
  
    return (
          <Fragment> 
              {/* <nav class="navbar navbar-expand-lg shadow-lg py-2 bg-gray-50 relative flex items-center w-full justify-between">
                <div class="px-6">
                  <button class="navbar-toggler border-0 py-3 lg:hidden leading-none text-xl bg-transparent text-gray-600 hover:text-gray-700 focus:text-gray-700 transition-shadow duration-150 ease-in-out" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContentX" aria-controls="navbarSupportedContentX" aria-expanded="false" aria-label="Toggle navigation">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" class="w-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                      <path fill="currentColor" d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
                    </svg>
                  </button>
                <div class="navbar-collapse collapse grow items-center" id="navbarSupportedContentX">
                  <ul class="navbar-nav mr-auto flex flex-row">
                    <li class="nav-item">
                      <a class="nav-link block pr-2 lg:px-2 py-2 text-gray-600 hover:text-gray-700 focus:text-gray-700 transition duration-150 ease-in-out" href="#!" data-mdb-ripple="true" data-mdb-ripple-color="light">Regular link</a>
                    </li>
                    <li class="nav-item dropdown static">
                      <a class="nav-link block pr-2 lg:px-2 py-2 text-gray-600 hover:text-gray-700 focus:text-gray-700 transition duration-150 ease-in-out dropdown-toggle flex items-center whitespace-nowrap" href="#" data-mdb-ripple="true" data-mdb-ripple-color="light" type="button" id="dropdownMenuButtonX" data-bs-toggle="dropdown"
                      aria-expanded="false">Mega menu
                        <svg  aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-down" class="w-2 ml-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                          <path fill="currentColor" d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"></path>
                        </svg>
                      </a>
                      <div class="dropdown-menu w-32 mt-0 hidden shadow-lg bg-white absolute  top-full" aria-labelledby="dropdownMenuButtonX">

                            <div class="bg-white text-gray-600">
                              <a href="#!" aria-current="true" class="block px-6 py-2 border-b border-gray-200 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Lorem ipsum</a>
                              <a href="#!" aria-current="true" class="block px-6 py-2 border-b border-gray-200 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Dolor sit</a>
                              <a href="#!" aria-current="true" class="block px-6 py-2 border-b border-gray-200 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Amet consectetur</a>
                              <a href="#!" aria-current="true" class="block px-6 py-2 border-b border-gray-200 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Cras justo odio</a>
                              <a href="#!" aria-current="true" class="block px-6 py-2 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Adipisicing elit</a>
                            </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </nav> */}
               
              <div className ={`${styles.content} sticky top-0 z-[200] bg-[#3F83F8] `}>   
                <nav className={` bg-[#3F83F8] border-gray-100 px-1 sm:px-3 py-2 pr-4 pl-3  `}>
                  <div className=" flex flex-wrap  flex justify-between content-center  mx-auto ">
                    <a href="/MainPage" className="flex content-center items-center">
                      <img src={process.env.PUBLIC_URL + "/icons/a-icon-chemical.png"} className="mr-3 h-6 sm:h-9 "  />
                      <span className={`${styles.textCustom} text-xl font-semibold whitespace-nowrap text-white`}>Sigma</span>
                    </a>
                    
                    <button type="button"  onClick = {handelOnClick} className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg  mr-10 px-5 py-2.5 text-center ">Log Out</button>
                      {/* <ul class="navbar-nav mr-auto flex flex-row">
                        <li class="nav-item">
                          <a class="nav-link block pr-2 lg:px-2 py-2 text-gray-600 hover:text-gray-700 focus:text-gray-700 transition duration-150 ease-in-out" href="#!" data-mdb-ripple="true" data-mdb-ripple-color="light">Regular link</a>
                        </li>
                        <li class="nav-item dropdown static">
                          <a class=" block pr-2 lg:px-2 py-2 text-white transition duration-150 ease-in-out dropdown-toggle flex items-center whitespace-nowrap" href="#" data-mdb-ripple="true" data-mdb-ripple-color="light"  id="dropdownMenuButtonX" data-bs-toggle="dropdown"
                          aria-expanded="false">Mega menu
                            <svg  aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-down" class="w-2 ml-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                              <path fill="currentColor" d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"></path>
                            </svg>
                          </a>
                          <div className={`dropdown-menu w-40 mt-2 hidden shadow-lg bg-white top-full"`} aria-labelledby="dropdownMenuButtonX"> */}
                            {/* <div class="px-6 lg:px-8 py-5">
                              <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6"> */}

                                {/* <div class=" bg-white  text-gray-600" >
                                  <a href="#!" aria-current="true" class="block px-6 py-2 border-b border-gray-200 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Lorem ipsum</a>
                                  <a href="#!" aria-current="true" class="block px-6 py-2 border-b border-gray-200 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Dolor sit</a>
                                  <a href="#!" aria-current="true" class="block px-6 py-2 border-b border-gray-200 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Amet consectetur</a>
                                  <a href="#!" aria-current="true" class="block px-6 py-2 border-b border-gray-200 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Cras justo odio</a>
                                  <a href="#!" aria-current="true" class="block px-6 py-2 w-full hover:bg-gray-50 hover:text-gray-700 transition duration-150 ease-in-out">Adipisicing elit</a>
                                </div> */}
                              {/* </div>  
                            </div>   */}
                          {/* </div> */}
                        {/* </li>
                      </ul>   */}
                  </div>
                </nav>
              </div>   
        </Fragment>  
            )
}
export default Navbar;