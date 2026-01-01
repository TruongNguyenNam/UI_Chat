import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { NotificationRepponseDTO } from '@/model/notification/NotificationResponseDTO';
const API_URL = "http://localhost:8080/api/v1/notification";
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

export const NotificationService = {
    getAllNotification: async (phone: string): Promise<ApiResponse<NotificationRepponseDTO>> => {
      try {
        const response = await axiosInstance.get(`${API_URL}`, {
          params: { phone }
        });
        return response.data;
      } catch (error) {
        console.error('lỗi không thể lấy được danh sách notification:', error);
        throw error;
      }
    },
    
    CountNotification: async () : Promise<ApiResponse<void>> => {
        try{
            const response = await axiosInstance.get(`${API_URL}/count`);
            return response.data;

        }catch (error){
            console.log('lỗi không thể lấy được số lượng notification', error);
            throw error;
        }

    }

  };
  








