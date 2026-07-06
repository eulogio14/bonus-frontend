import axios from 'axios';

const URL = 8080 /*Coloca aqui el puerto del backend*/ 
const api = axios.create({
  baseURL: `http://127.0.0.1:${URL}`
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

export default api