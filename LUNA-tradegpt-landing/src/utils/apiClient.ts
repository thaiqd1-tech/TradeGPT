import { API_ENDPOINTS } from '../config/api';
import { getAccessToken, getRefreshToken, handleUnauthorized, setAuthData } from './auth';

// API client với automatic token refresh
class ApiClient {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAccessToken();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Nếu token hết hạn (401), thử refresh
      if (response.status === 401) {
        return this.handleTokenRefresh(url, requestOptions);
      }
      
      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  private async handleTokenRefresh(originalUrl: string, originalOptions: RequestInit): Promise<Response> {
    if (this.isRefreshing) {
      // Nếu đang refresh, đợi kết quả
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        return this.retryRequest(originalUrl, originalOptions);
      });
    }

    this.isRefreshing = true;

    try {
      const refreshed = await this.performRefresh();
      this.processQueue(null);
      if (refreshed) {
        console.log('Token refreshed successfully');
        return this.retryRequest(originalUrl, originalOptions);
      }
      throw new Error('Unable to refresh token');
    } catch (error) {
      this.processQueue(error);
      console.warn('Session expired. Please login again.');
      handleUnauthorized();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async performRefresh(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    // Gửi refresh_token theo body JSON để đồng bộ với backend
    const response = await fetch(API_ENDPOINTS.auth.refresh, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch (_) {
      // ignore
    }

    if (!response.ok) {
      return false;
    }

    // Chuẩn hoá dữ liệu để setAuthData
    const normalized = data && data.success
      ? {
          access_token: data.access_token || data.token,
          refresh_token: data.refresh_token,
          user: data.user || JSON.parse(localStorage.getItem('user') || 'null'),
        }
      : data;

    if (!normalized || !normalized.access_token) return false;
    setAuthData(normalized);
    return true;
  }

  private async retryRequest(url: string, options: RequestInit): Promise<Response> {
    const newToken = getAccessToken();
    
    const retryOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
      },
    };

    return fetch(url, retryOptions);
  }
}

// AI Service API Client (không có token refresh)
export const aiApiClient = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const baseUrl = (import.meta as any).env.VITE_AI_SERVICE_BASE_URL;
  const fullUrl = `${baseUrl}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`AI Service API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// AI Stream API Client (cho streaming)
export const aiStreamApiClient = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const baseUrl = (import.meta as any).env.VITE_AI_SERVICE_BASE_URL;
  const fullUrl = `${baseUrl}${url}`;
  
  return fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

export const apiClient = new ApiClient();
export default apiClient;