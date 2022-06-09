import React,{useState} from 'react';

const AuthContext = React.createContext();
    // token:'a',
    // isLoggedIn:true,
    // onLogin:(username,password) =>{},
    // onLogOut:()=>{}
// });
const retrieveStoredToken = () => {
    const storedToken = localStorage.getItem('token');
  
    return {
      token: storedToken
    };
  };

export const AuthContextProvider = (props)=>{
    const tokenData = retrieveStoredToken();
    let initialToken;
    const [token, setToken] = useState(initialToken);
    const [isLoggedIn,setIsLoggin] = useState();

    const loginHandler = (token) =>{
        console.log(token.username)
        setToken(token);
        // localStorage.setItem('token', JSON.stringify(token));
        sessionStorage.setItem('token', JSON.stringify(token));
        setIsLoggin(true);
        console.log(isLoggedIn);
    }
    const failLogin = () =>{
        // console.log(token.username)
        setIsLoggin(false);
        console.log(isLoggedIn);
    }
    const showTabHandler = () =>{
        setIsLoggin(true);
        console.log(isLoggedIn);
    }
    const logOutHandler = () =>{
        setToken(null);
        sessionStorage.removeItem('token');
        // console.log(token)
        // setToken(token);
        // localStorage.setItem('token', token);
        // setIsLoggin(false);
        // console.log(isLoggedIn);
    }
    const contextValue = {
        token: token,
        isLoggedIn: isLoggedIn,
        onLogin:loginHandler, 
        onLogOut:logOutHandler,
        failLogin:failLogin,
        onShowTab:showTabHandler
  };
    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>
};

export default AuthContext;