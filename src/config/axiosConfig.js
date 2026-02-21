import axios from 'axios';

// Forzamos la URL de Render para que no use más localhost
const axiosInstance = axios.create({
    baseURL: 'https://turnos-backend-ns8s.onrender.com',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            sessionStorage.removeItem('jwt_token');
            sessionStorage.removeItem('user_role');
            if (window.location.pathname !== '/') {
                alert("Tu sesión ha expirado. Por favor ingresa nuevamente.");
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;