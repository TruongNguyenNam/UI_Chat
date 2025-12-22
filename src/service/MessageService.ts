import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { MessageResponseDTO } from '../model/message/MessageResponseDTO';
import type { MessageRequestDTO } from './../model/message/MessageRequestDTO';

const API_URL = "http://localhost:8080/api/v1/message";
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

// src/service/MessageService.ts
export const MessageService = {
    getChatMessages: async (chatId: number): Promise<ApiResponse<MessageResponseDTO[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<MessageResponseDTO[]>>(
              `${API_URL}/chat/${chatId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching chat messages:', error);
            throw new Error('Failed to fetch chat messages. Please try again later.');
        }
    },
    
    sendMessage: async (
      message: MessageRequestDTO,
      files?: File[]
    ): Promise<ApiResponse<void>> => {
      const formData = new FormData();
    
      formData.append(
        "message",
        new Blob([JSON.stringify(message)], { type: "application/json" })
      );
    
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append("files", file); // cùng key "files"
        });
      }
    
      const response = await axiosInstance.post<ApiResponse<void>>(
        `${API_URL}/send`,
        formData
      );
    
      return response.data;
    },


    
};