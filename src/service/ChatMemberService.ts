import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { ChatMemberResponseDTO } from '../model/chat_member/ChatMemberResponseDTO';
const API_URL = "http://localhost:8080/api/v1/chat_member";
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
export const ChatMemberService = {
    sumUnreadByMe: async (): Promise<ApiResponse<number>> => {
        try {
            const response = await axiosInstance.get(`${API_URL}`);
            return response.data;
        } catch (error) {
            console.error('lấy danh sách tin nhắn chưa đọc thất bại:', error);
            throw new Error('Failed to fetch unread message . Please try again later.');
        }
    },

    findByChatId: async (chatId: number): Promise<ApiResponse<ChatMemberResponseDTO[]>> => {
        try {
            const response = await axiosInstance.get(`${API_URL}/${chatId}`)
            return response.data;
        } catch (error) {
            console.error('lấy danh sách thành viên trong đoạn chat đó thất bại:', error);
            throw new Error('Failed to fetch many people by chat . Please try again later.');
        }

    }



}
