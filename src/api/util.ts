import axios from "axios";

export const axiosInstance = axios.create({
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
    error => Promise.reject(error)
);

// TODO: Instead of two axios instances, create an API gateway.
export const axiosInstanceRooms = axios.create({
    baseURL: "http://localhost:8503/api",
});
axiosInstanceRooms.interceptors.request.use(
    config => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);
axiosInstanceRooms.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
);

// TODO: Instead of two axios instances, create an API gateway.
export const axiosInstanceReservations = axios.create({
    baseURL: "http://localhost:8506/api",
});
axiosInstanceReservations.interceptors.request.use(
    config => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);
axiosInstanceReservations.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
);