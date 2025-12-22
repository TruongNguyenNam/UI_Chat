export interface ApiResponse<T> {
    status: number;          // ví dụ: 200
    message: string;         // thông điệp trả về
    data?: T | null;         // có thể null hoặc undefined
  }
