import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { MessageReactionsRequestDTO } from '../model/reactions/MessageReactionsRequestDTO';
import type { MessageReactionsResponseDTO } from './../model/reactions/MessageReactionsResponeDTO';

const API_URL = "http://localhost:8080/api/v1/message_reactions";
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
    getMessageReactions: async (messageId: number): Promise<ApiResponse<MessageReactionsResponseDTO[]>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<MessageReactionsResponseDTO[]>>(
              `${API_URL}/${messageId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching chat messages:', error);
            throw new Error('Failed to fetch chat messages. Please try again later.');
        }
    },
    
    sendMessageReactions: async (
        payload: MessageReactionsRequestDTO
    ): Promise<ApiResponse<void>> => {
        try {
            const response = await axiosInstance.post<ApiResponse<void>>(
                API_URL,
                payload
            );
            return response.data;
        } catch (error) {
            console.error('Error sending message reactions:', error);
            throw new Error('Failed to send message reaction.');
        }
    }
    


    
};