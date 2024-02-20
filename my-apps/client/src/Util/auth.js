import { jwtDecode } from "jwt-decode";
import {useContext, useEffect} from 'react';
import  {LogoutApi}  from '../Store/logoutApi'


export function getTokenDuration() {

  const accessToken = jwtDecode(JSON.parse(sessionStorage.getItem('accessToken')));
  const storedExpirationDate = accessToken.exp;
  const expirationDate = new Date((storedExpirationDate*1000));
  const now = new Date();
  const duration =  expirationDate - now.getTime();
  console.log(duration)

  return duration;
}

export function getAuthToken() {
  const token = JSON.parse(sessionStorage.getItem('accessToken'));

  if (!token) {
    return null;
  }

  const tokenDuration = getTokenDuration();

  if (tokenDuration < 0) {
    return 'EXPIRED';
  }

  return token;
}

export function tokenLoader() {
  const token = getAuthToken();
  return token;
}

export function checkAuthLoader() {
  const token = getAuthToken();
  
  if (!token) {
    return redirect('/auth');
  }
}