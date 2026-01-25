import axios from 'axios';

// Browser'da baseURL'i dinamik olarak ayarla
const getBaseURL = () => {
 if (typeof window !== 'undefined') {
  return window.location.origin;
 }
 return '';
};

const axiosInstance = axios.create({
 baseURL: getBaseURL(),
 withCredentials: true,
 headers: {
  'Content-Type': 'application/json',
 },
});

// Her istekte baseURL'i güncelle (browser'da)
axiosInstance.interceptors.request.use(
 (config) => {
  if (typeof window !== 'undefined') {
   config.baseURL = window.location.origin;
  }
  return config;
 },
 (error) => {
  return Promise.reject(error);
 }
);

export default axiosInstance;