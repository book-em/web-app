import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8500/api",
});

axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized. Redirecting to login...');
            // TODO: Redirect...?
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;