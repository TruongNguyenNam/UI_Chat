import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { FriendResponseDTO } from '../model/friend/FriendResponseDTO';
const API_URL = "http://localhost:8080/api/v1/friend";
const axiosInstance = axios.create();
const getAuthToken = (): string | null => {
    return sessionStorage.getItem('accessToken');
};

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const FriendService = {
    findByPhone: async (phone: string): Promise<ApiResponse<FriendResponseDTO>> => {
      try {
        const response = await axiosInstance.get(`${API_URL}/phone`, {
          params: { phone }
        });
        return response.data;
      } catch (error) {
        console.error('lỗi không thể tìm bạn bằng phone:', error);
        throw error;
      }
    },
  };
  


