import axios from 'axios';

// Tarayıcıda her zaman same-origin (relative URL). Bu, production'da 
// API route'larının aynı domain'den çağrılmasını sağlar.
const baseURL =
 typeof window !== 'undefined'
  ? '' // Client-side'da relative URL kullan (aynı domain)
  : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'); // Server-side'da base URL kullan

const axiosInstance = axios.create({
 baseURL,
 withCredentials: true,
 timeout: 30000, // 30 saniye timeout
 headers: {
  'Content-Type': 'application/json',
 },
});

// Request interceptor - hata ayıklama için
axiosInstance.interceptors.request.use(
 (config) => {
  // Development'ta log ekle
  if (process.env.NODE_ENV === 'development') {
   console.log('API Request:', config.method?.toUpperCase(), config.url);
  }
  return config;
 },
 (error) => {
  return Promise.reject(error);
 }
);

// Response interceptor - hata yönetimi için
axiosInstance.interceptors.response.use(
 (response) => {
  return response;
 },
 (error) => {
  // Development'ta hata logla
  if (process.env.NODE_ENV === 'development') {
   console.error('API Error:', error.message, error.config?.url);
  }
  return Promise.reject(error);
 }
);

export default axiosInstance;