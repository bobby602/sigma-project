import React, { useState } from 'react';

const AuthContext = React.createContext();

const retrieveStoredToken = () => {
  const storedToken = sessionStorage.getItem('token'); // ✅ ใช้ sessionStorage
  const accessToken = sessionStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken');

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    token: storedToken
  };
};

export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();
  let initialToken;
  const [token, setToken] = useState(initialToken);
  const [token2, setToken2] = useState(initialToken);
  const [accessToken, setaccessToken] = useState(initialToken);
  const [refreshToken, setRefreshToken] = useState(initialToken);
  const [isLoggedIn, setIsLoggin] = useState();

  const loginHandler = (loginData) => {
    console.log('🔧 AuthContext loginHandler received:', loginData);
    
    // ✅ รองรับทั้ง format เก่าและใหม่
    let user, accessTokenValue, refreshTokenValue, additionalInfo;
    
    if (loginData.success || loginData.user) {
      // Format ใหม่จาก Redux
      user = loginData.user;
      accessTokenValue = loginData.accessToken;
      refreshTokenValue = loginData.refreshToken;
      additionalInfo = loginData.additionalInfo;
    } else if (loginData.result && loginData.result[0]) {
      // Format เก่าจาก backend
      user = loginData.result[0][0];
      accessTokenValue = loginData.access_token;
      refreshTokenValue = loginData.refresh_token;
      additionalInfo = loginData.resultInfo ? loginData.resultInfo[0][0] : null;
    } else {
      console.error('❌ Unknown login data format:', loginData);
      return;
    }

    console.log('✅ Setting user data:', { user, accessTokenValue, refreshTokenValue });

    // Set state
    setToken(user);
    setaccessToken(accessTokenValue);
    setRefreshToken(refreshTokenValue);
    
    // Handle additional info
    if (additionalInfo) {
      setToken2(additionalInfo);
      sessionStorage.setItem('token2', JSON.stringify(additionalInfo));
    }

    // Store in sessionStorage
    sessionStorage.setItem('token', JSON.stringify(user));
    sessionStorage.setItem('accessToken', JSON.stringify(accessTokenValue));
    sessionStorage.setItem('refreshToken', JSON.stringify(refreshTokenValue));
    
    setIsLoggin(true);
  };

  const failLogin = () => {
    setIsLoggin(false);
  };

  const showTabHandler = () => {
    setIsLoggin(true);
  };

  const logOutHandler = () => {
    console.log('🚪 AuthContext logout');
    setToken(null);
    setToken2(null);
    setaccessToken(null);
    setRefreshToken(null);
    setIsLoggin(false);
    
    // Clear storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token2');
    sessionStorage.clear();
  };

  const tokenAdd = (tokenData) => {
    // ✅ รองรับทั้ง format เก่าและใหม่
    const newAccessToken = tokenData.accessToken || tokenData.access_token;
    const newRefreshToken = tokenData.refreshToken || tokenData.refresh_token;
    
    setaccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    sessionStorage.setItem('accessToken', JSON.stringify(newAccessToken));
    sessionStorage.setItem('refreshToken', JSON.stringify(newRefreshToken));
  };

  const contextValue = {
    token: token,
    isLoggedIn: isLoggedIn,
    onLogin: loginHandler,
    onLogOut: logOutHandler,
    failLogin: failLogin,
    GenNewToken: tokenAdd,
    onShowTab: showTabHandler
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;