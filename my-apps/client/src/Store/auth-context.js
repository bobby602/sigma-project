import React, { useEffect, useMemo, useState } from 'react';

const AuthContext = React.createContext(null);

// helper ลอก " ออก + รองรับกรณีเคย stringify มา
const normalizeToken = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'string' ? parsed : raw;
  } catch {
    return String(raw).replace(/^"+|"+$/g, '').trim();
  }
};

const retrieveStoredToken = () => {
  // ใช้ sessionStorage เป็นหลัก
  const storedUserRaw = sessionStorage.getItem('token'); // เก็บ user เป็น JSON (ตั้งชื่อ key เดิมของคุณ)
  const storedAccessRaw =
    sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  const storedRefreshRaw =
    sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');

  let user = null;
  try {
    user = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  } catch {
    user = null;
  }

  const accessToken = normalizeToken(storedAccessRaw);
  const refreshToken = normalizeToken(storedRefreshRaw);

  return { user, accessToken, refreshToken };
};

export const AuthContextProvider = (props) => {
  const boot = useMemo(retrieveStoredToken, []);
  const [token, setToken] = useState(boot.user || null);                 // เก็บข้อมูล user
  const [token2, setToken2] = useState(null);                            // ข้อมูลเสริม
  const [accessToken, setAccessToken] = useState(boot.accessToken || null);
  const [refreshToken, setRefreshToken] = useState(boot.refreshToken || null);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(boot.accessToken));

  // sync state -> storage (เฉพาะ token จริงๆ)
  useEffect(() => {
    if (accessToken) sessionStorage.setItem('accessToken', accessToken);
    if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
    setIsLoggedIn(Boolean(accessToken));
  }, [accessToken, refreshToken]);

  const loginHandler = (loginData) => {
    console.log('🔧 AuthContext loginHandler received:', loginData);

    let user, accessTokenValue, refreshTokenValue, additionalInfo;

    if (loginData?.success || loginData?.user) {
      // format ใหม่
      user = loginData.user;
      accessTokenValue = loginData.accessToken;
      refreshTokenValue = loginData.refreshToken;
      additionalInfo = loginData.additionalInfo;
    } else if (loginData?.result && loginData.result[0]) {
      // format เก่า
      user = loginData.result[0][0];
      accessTokenValue = loginData.access_token;
      refreshTokenValue = loginData.refresh_token;
      additionalInfo = loginData.resultInfo ? loginData.resultInfo[0][0] : null;
    } else {
      console.error('❌ Unknown login data format:', loginData);
      return;
    }

    // set state
    setToken(user);
    setAccessToken(normalizeToken(accessTokenValue));
    setRefreshToken(normalizeToken(refreshTokenValue));

    if (additionalInfo) {
      setToken2(additionalInfo);
      sessionStorage.setItem('token2', JSON.stringify(additionalInfo));
    }

    // เก็บ user เป็น JSON (ตามเดิม)
    sessionStorage.setItem('token', JSON.stringify(user));

    // เก็บ token แบบ "ดิบ" ไม่มี stringify
    sessionStorage.setItem('accessToken', normalizeToken(accessTokenValue));
    sessionStorage.setItem('refreshToken', normalizeToken(refreshTokenValue));

    setIsLoggedIn(true);
  };

  const tokenAdd = (tokenData) => {
    // ใช้ตอน refresh token
    const newAccessToken = normalizeToken(tokenData.accessToken || tokenData.access_token);
    const newRefreshToken = normalizeToken(tokenData.refreshToken || tokenData.refresh_token);

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    // ❗️อย่า stringify
    sessionStorage.setItem('accessToken', newAccessToken);
    sessionStorage.setItem('refreshToken', newRefreshToken);
  };

  const logOutHandler = () => {
    console.log('🚪 AuthContext logout');

    setToken(null);
    setToken2(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsLoggedIn(false);

    // ล้าง sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token2');
    sessionStorage.clear();

    // กันสับสน: เคลียร์ localStorage ที่อาจมี token เก่าค้าง
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const failLogin = () => setIsLoggedIn(false);
  const showTabHandler = () => setIsLoggedIn(true);

  const contextValue = {
    token,
    isLoggedIn,
    onLogin: loginHandler,
    onLogOut: logOutHandler,
    failLogin,
    GenNewToken: tokenAdd,
    onShowTab: showTabHandler,
    accessToken,        // เผื่อ component อื่นอยากอ่านตรงๆ
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
