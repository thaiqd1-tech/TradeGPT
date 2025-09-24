// file: utils/auth.utils.ts

import { AuthResponse } from '../types/auth';

// Đồng bộ với toàn bộ codebase
const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // Hỗ trợ cả hai key để tương thích với authService.js
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setAuthData = (data: AuthResponse): void => {
  if (typeof window === 'undefined') return;
  // Lưu với cả hai key để tương thích
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  localStorage.setItem('access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  }
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  // Xóa cả hai key để đảm bảo clean up hoàn toàn
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem('access_token');
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const handleUnauthorized = (): void => {
  clearAuthData();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};