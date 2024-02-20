import React,{useState} from 'react';

const AuthContext = React.createContext();
const retrieveStoredToken = () => {
    const storedToken = localStorage.getItem('token');
    const accessToken = localStorage.getItem('accessToken');
    const RefreshToken = localStorage.getItem('refreshToken');
  
    return {
      accessToken :accessToken,
      refreshToken :RefreshToken,
      token: storedToken
    };
  };

export const AuthContextProvider = (props)=>{
    const tokenData = retrieveStoredToken();
    let initialToken;
    const [token, setToken] = useState(initialToken);
    const [token2, setToken2] = useState(initialToken);
    const [accessToken, setaccessToken] = useState(initialToken);
    const [refreshToken, setRefreshToken] = useState(initialToken);
    const [isLoggedIn,setIsLoggin] = useState();

    const loginHandler = (token) =>{
        setToken(token.result[0][0]);
        if(token.resultInfo != undefined && token.resultInfo !=''){
            setToken2(token.resultInfo[0][0]);
            sessionStorage.setItem('token2', JSON.stringify(token.resultInfo[0][0]));
        }
        setaccessToken(token.access_token);
        setRefreshToken(token.refresh_token);
        sessionStorage.setItem('accessToken', JSON.stringify(token.access_token));
        sessionStorage.setItem('refreshToken', JSON.stringify(token.refresh_token));
        sessionStorage.setItem('token', JSON.stringify(token.result[0][0]));
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
        setToken2(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.clear();
    }
    const tokenAdd = (token) =>{
        setaccessToken(token.access_token);
        setRefreshToken(token.refresh_token);
        sessionStorage.setItem('accessToken', JSON.stringify(token.access_token));
        sessionStorage.setItem('refreshToken', JSON.stringify(token.refresh_token));
    }
    const contextValue = {
        token: token,
        isLoggedIn: isLoggedIn,
        onLogin:loginHandler, 
        onLogOut:logOutHandler,
        failLogin:failLogin,
        GenNewToken:tokenAdd,
        onShowTab:showTabHandler
  };
    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>
};

export default AuthContext;