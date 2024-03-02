import axios from "axios";
const BASE_URL = 'http://localhost:9001'; 
// const BASE_URL = 'http://1.0.169.153:9001';


export const axiosPrivate = axios.create({
    baseURL: BASE_URL
});