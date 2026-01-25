import axios from 'axios';

// Browser'da otomatik olarak mevcut domain'i kullan, server-side'da environment variable kullan
const axiosInstance = axios.create({
 withCredentials: true,
 headers: {
  'Content-Type': 'application/json',
 },
});

// Request interceptor: Her istekte baseURL'i dinamik olarak ayarla
axiosInstance.interceptors.request.use(
 (config) => {
  // Browser'da: otomatik olarak mevcut domain'i kullan
  if (typeof window !== 'undefined') {
   config.baseURL = window.location.origin;
  } else {
   // Server-side rendering için: environment variable kullan
   config.baseURL = process.env.NEXT_PUBLIC_BASE_URL || '';
  }
  return config;
 },
 (error) => {
  return Promise.reject(error);
 }
);

// Response interceptor: Hataları console'a yazdır (debug için)
axiosInstance.interceptors.response.use(
 (response) => response,
 (error) => {
  // Sadece browser'da console'a yazdır
  if (typeof window !== 'undefined') {
   console.error('API Error:', {
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    message: error.message,
    baseURL: error.config?.baseURL,
    fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
   });
  }
  return Promise.reject(error);
 }
);

export default axiosInstance;