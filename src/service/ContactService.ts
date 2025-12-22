import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { ContactResponseDTO } from '../model/contact/ContactResponseDTO';
import type { ContactRequestDTO } from '@/model/contact/ContactRequestDTO';
const API_URL = "http://localhost:8080/api/v1/contact";
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

export const ContactService = {
    getAllContacts: async (): Promise<ApiResponse<ContactResponseDTO[]>> => {
        try {
            const response = await axiosInstance.get(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('lỗi không thể lấy danh sách bạn bè:', error);
            throw new Error('Failed to fetch contacts. Please try again later.');
        }
    },

    // ==========================
  // Gửi lời mời kết bạn
  // ==========================
  sendFriendRequest: async (
    payload: ContactRequestDTO
  ): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(
        `${API_URL}/send`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi gửi lời mời kết bạn:", error);
      throw new Error("Failed to send friend request");
    }
  },

  getPendingRequests: async (): Promise<ApiResponse<ContactResponseDTO[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<ContactResponseDTO[]>>(
        `${API_URL}/pending`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy danh sách pending:", error);
      throw new Error("Failed to fetch pending requests");
    }
  },

  // ==========================
  // Từ chối lời mời
  // ==========================
  rejectFriendRequest: async (
    contactId: number
  ): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(
        `${API_URL}/reject/${contactId}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi từ chối lời mời:", error);
      throw new Error("Failed to reject friend request");
    }
  },

  // ==========================
  // Chấp nhận lời mời
  // ==========================
  acceptFriendRequest: async (
    contactId: number
  ): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(
        `${API_URL}/accepted/${contactId}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi chấp nhận lời mời:", error);
      throw new Error("Failed to accept friend request");
    }
  },

}






