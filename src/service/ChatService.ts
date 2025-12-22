import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { ChatResponseDTO } from '../model/chat/ChatResponseDTO';
const API_URL = "http://localhost:8080/api/v1/chat";
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

export const ChatService = {
    findAllByChatType: async (): Promise<ApiResponse<ChatResponseDTO[]>> => {
        try {
            const response = await axiosInstance.get(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('lỗi không thể lấy danh đoạn chat:', error);
            throw new Error('Failed to fetch chat. Please try again later.');
        }
    },

    findByChatId: async (chatId: number) : Promise<ApiResponse<ChatResponseDTO>> => {
        try {
            const response = await axiosInstance.get(`${API_URL}/${chatId}`)
            return response.data;
        } catch (error) {
            console.error('lỗi không thể tìm thấy được đoạn chat:', error);
            throw new Error('Failed to fetch chat. Please try again later.');
        }


    }




}









