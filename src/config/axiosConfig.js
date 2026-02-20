import axios from 'axios';

// 1. Configurar la URL base dinámica
// Si existe la variable VITE_API_URL en el entorno (producción), la usa.
// Si no, usa localhost:8080 (desarrollo).
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// 2. INTERCEPTOR DE REQUEST (Salida)
// Antes de que salga la petición, le pegamos el token automáticamente
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

// 3. INTERCEPTOR DE RESPONSE (Llegada)
// Si la respuesta es un error 403 (Prohibido/Vencido), cerramos sesión.
axiosInstance.interceptors.response.use(
    (response) => response, // Si todo sale bien, dejamos pasar la respuesta
    (error) => {
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            // El token venció o no es válido
            sessionStorage.removeItem('jwt_token');
            sessionStorage.removeItem('user_role');
            
            // Solo alertamos y redirigimos si no estamos ya en la raíz
            if (window.location.pathname !== '/') {
                alert("Tu sesión ha expirado o no tienes permisos. Por favor ingresa nuevamente.");
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;