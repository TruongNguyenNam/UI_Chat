import axios from 'axios';
import type { ApiResponse } from "../utils/ApiResponse";
import type { MediaResponseDTO } from '../model/media/MediaResponseDTO';
// import { MediaResponseDTO } from './../model/media/MediaResponseDTO';

const API_URL = "http://localhost:8080/api/v1/media";
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
export const MediaService = {
    getAllMediaByChatId: async (chatId: number): Promise<ApiResponse<MediaResponseDTO[]>> => {
        try {
            const response = await axiosInstance.get(`${API_URL}/${chatId}`);
            return response.data;
        } catch (error) {
            console.error('lấy danh sách media thất bại:', error);
            throw new Error('Failed to fetch media. Please try again later.');
        }
    },


}
