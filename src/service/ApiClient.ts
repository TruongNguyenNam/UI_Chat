// // ApiClient.ts
// import axios from 'axios';
// import { getAuthToken, logout } from './AuthService';

// const ApiClient = axios.create({
//   baseURL: 'http://localhost:8080/api/v1',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Attach token for every secured request
// ApiClient.interceptors.request.use(
//   (config) => {
//     const token = getAuthToken();
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Handle token refresh globally
// ApiClient.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config;
//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true;

//       const refreshToken = sessionStorage.getItem('refreshToken');

//       if (refreshToken) {
//         try {
//           // Refresh token bằng AuthService
//           const refresh = await axios.get(
//             'http://localhost:8080/api/v1/auth/refreshToken',
//             { params: { refreshToken } }
//           );

//           sessionStorage.setItem('accessToken', refresh.data.data.token);

//           original.headers['Authorization'] = `Bearer ${refresh.data.data.token}`;

//           return ApiClient(original);
//         } catch (e) {
//           logout();
//           window.location.href = '/auth/login';
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default ApiClient;
