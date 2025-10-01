// src/api/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // Swagger에 명시된 기본 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터를 추가하여 data 필드를 직접 반환
apiClient.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    // 오류 처리 로직 (예: UI에 오류 메시지 표시)
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;