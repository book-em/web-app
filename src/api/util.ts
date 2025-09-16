import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: (window.__ENV__?.VITE_USER_SERVICE_URL || "http://localhost:8500") + "/api",
});
axiosInstance.interceptors.request.use(
    config => {
        console.log(window.__ENV__);
        console.log(window.__ENV__?.VITE_USER_SERVICE_URL);

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
    baseURL: (window.__ENV__?.VITE_ROOM_SERVICE_URL || "http://localhost:8503") + "/api",
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

// No + "/api" for this one since this isn't an API server.
export const RoomImageURL: string = (window.__ENV__?.VITE_ROOM_SERVICE_IMAGES_URL || "http://localhost:8505");


// TODO: Instead of two axios instances, create an API gateway.
export const axiosInstanceReservations = axios.create({
    baseURL: (window.__ENV__?.VITE_RESERVATION_SERVICE_URL || "http://localhost:8506") + "/api",
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