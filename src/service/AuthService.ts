import axios from 'axios';
import type { ApiResponse } from '../utils/ApiResponse';

const API_URL = 'http://localhost:8080/api/v1/auth';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem('accessToken');
};

export const logout = (): void => {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userInfo');
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await AuthService.RefreshToken(refreshToken);
          if (refreshResponse.data) {
            sessionStorage.setItem('accessToken', refreshResponse.data.token);
            sessionStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
            originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.token}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        logout();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const AuthService = {
  Login: async (loginForm: LoginForm): Promise<ApiResponse<LoginInfoDto>> => {
    const response = await axiosInstance.post<ApiResponse<LoginInfoDto>>('/login', loginForm);
    return response.data;
  },

  RefreshToken: async (refreshToken: string): Promise<ApiResponse<TokenDTO>> => {
    const response = await axiosInstance.get<ApiResponse<TokenDTO>>('/refreshToken', {
      params: { refreshToken },
    });
    return response.data;
  },

  Register: async (registerForm: RegisterForm): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.post<ApiResponse<UserResponse>>('/register', registerForm);
    return response.data;
  },

};

export interface LoginInfoDto {
  userId?: number;
  username?: string;
  password?: string;
  phoneNumber?: string;
  email?: string;
  token?: string;
  refreshToken?: string;
  role?: string;
  gender?: string;
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
  status?: string;
}

export interface UserResponse {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  message?: string;
  role?: string;
  password?: string;
  phoneNumber?: string;
  gender?: string;
  avatarUrl?: string;
  status?: string;
}

// DTOs
export interface LoginForm {
  username: string;
  password: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  email: string;
}

export interface TokenDTO {
  token: string;
  refreshToken: string;
}
