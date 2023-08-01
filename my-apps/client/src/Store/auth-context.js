import React,{useState} from 'react';

const AuthContext = React.createContext();
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
    const [token2, setToken2] = useState(initialToken);
    const [isLoggedIn,setIsLoggin] = useState();

    const loginHandler = (token) =>{
        // console.log(token.result[0][0])
        setToken(token.result[0][0]);
        setToken2(token.resultInfo[0][0]);
        sessionStorage.setItem('token', JSON.stringify(token.result[0][0]));
        sessionStorage.setItem('token2', JSON.stringify(token.resultInfo[0][0]));
        setIsLoggin(true);
    }
    const failLogin = () =>{
        setIsLoggin(false);
    }
    const showTabHandler = () =>{
        setIsLoggin(true);
    }
    const logOutHandler = () =>{
        setToken(null);
        sessionStorage.removeItem('token');
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