import axios from "axios";
const BASE_URL = 'http://localhost:9001';


export const axiosPrivate = axios.create({
    baseURL: BASE_URL
});