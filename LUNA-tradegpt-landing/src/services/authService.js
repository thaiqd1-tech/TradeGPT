// Authentication service với các API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://superbai.io/api';

class AuthService {
  // Helper method để tạo headers
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      // Thử lấy token từ cả hai key để đảm bảo tương thích
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // POST /auth/login
  async login(email, password) {
    try {
      console.log('AuthService: Attempting login to:', `${API_BASE_URL}/auth/login`);
      
      const normalizedEmail = (email || '').trim().toLowerCase();
      const normalizedPassword = (password || '').trim();

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
      });

      console.log('AuthService: Response status:', response.status);
      console.log('AuthService: Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('AuthService: Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${response.status}`);
      }

      const data = await response.json();
      console.log('AuthService: Response data:', data);

      if (!response.ok) {
        // Log chi tiết hơn về lỗi
        console.error('AuthService: Login failed details:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          url: `${API_BASE_URL}/auth/login`
        });
        
        // Trả về thông báo lỗi chi tiết hơn
        let errorMessage = data.message || data.error || `Login failed with status ${response.status}`;
        
        // Xử lý các lỗi cụ thể
        if (data.code === 'LOGIN_FAILED' && data.error === 'Invalid credentials') {
          errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.';
        } else if (data.code === 'LOGIN_FAILED') {
          errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
        } else if (data.code === 'REGISTRATION_FAILED' && data.error === 'user already exists') {
          errorMessage = 'Tài khoản đã tồn tại. Bạn có thể đăng nhập hoặc thử email khác.';
        } else if (data.code === 'REGISTRATION_FAILED') {
          errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
        }
        
        throw new Error(errorMessage);
      }

      // Lưu tokens vào localStorage
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token', data.access_token); // Thêm key 'token' để tương thích với api.ts
        console.log('AuthService: Access token saved');
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
        console.log('AuthService: Refresh token saved');
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('AuthService: User data saved');
      }

      return data;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      
      // Re-throw với thông tin chi tiết hơn
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      } else if (error.name === 'SyntaxError') {
        throw new Error('Server returned invalid response. Please try again.');
      } else {
        throw error;
      }
    }
  }

  // POST /auth/register
  async register(email, password, name) {
    try {
      console.log('AuthService: Attempting registration to:', `${API_BASE_URL}/auth/register`);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      console.log('AuthService: Registration response:', data);

      if (!response.ok) {
        // Xử lý các lỗi cụ thể
        let errorMessage = data.message || data.error || 'Registration failed';
        
        if (data.code === 'REGISTER_EMAIL_ALREADY_EXISTS') {
          errorMessage = 'Email đã tồn tại. Bạn có thể đăng nhập hoặc thử email khác.';
        } else if (data.code === 'REGISTER_PASSWORD_TOO_SHORT') {
          errorMessage = 'Mật khẩu phải có ít nhất 8 ký tự.';
        } else if (data.code === 'REGISTRATION_FAILED' && data.error === 'user already exists') {
          errorMessage = 'Tài khoản đã tồn tại. Bạn có thể đăng nhập hoặc thử email khác.';
        }
        
        throw new Error(errorMessage);
      }

      // Trong dự án mẫu, register chỉ gửi mã xác thực, không trả về token
      // Chỉ lưu thông tin user tạm thời để verify
      if (data.user) {
        localStorage.setItem('temp_user', JSON.stringify(data.user));
      }
      if (data.email) {
        localStorage.setItem('temp_email', data.email);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // POST /auth/verify-email
  async verifyEmail(email, code) {
    try {
      console.log('AuthService: Verifying email:', email);
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      console.log('AuthService: Email verification response:', data);

      if (!response.ok) {
        let errorMessage = data.message || data.error || 'Email verification failed';
        
        if (data.code === 'VERIFY_CODE_INVALID') {
          errorMessage = 'Mã xác thực không đúng. Vui lòng kiểm tra lại.';
        } else if (data.code === 'VERIFY_CODE_EXPIRED') {
          errorMessage = 'Mã xác thực đã hết hạn. Vui lòng đăng ký lại.';
        }
        
        throw new Error(errorMessage);
      }

      // Sau khi verify thành công, có thể trả về token hoặc chỉ thông báo thành công
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Xóa thông tin tạm thời
      localStorage.removeItem('temp_user');
      localStorage.removeItem('temp_email');

      return data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // POST /auth/google/token
  async googleLogin(idToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/token`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      // Lưu tokens vào localStorage
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token', data.access_token); // Thêm key 'token' để tương thích với api.ts
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // POST /auth/refresh
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Gửi refresh_token trong body; không đính kèm Authorization của access token cũ
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (!response.ok || (typeof data === 'object' && data && data.success === false)) {
        throw new Error((data && (data.message || data.error)) || 'Token refresh failed');
      }

      // Hỗ trợ đồng thời field 'token' và 'access_token'
      const newAccessToken = data.access_token || data.token;
      if (newAccessToken) {
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('token', newAccessToken);
      }

      // Cập nhật refresh token nếu backend trả về mới
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      // Cập nhật user nếu có
      if (data.user) {
        try {
          const existing = localStorage.getItem('user');
          const existingUser = existing ? JSON.parse(existing) : {};
          const merged = { ...existingUser, ...data.user };
          localStorage.setItem('user', JSON.stringify(merged));
        } catch (_) {
          // fallback nếu parse lỗi
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Không logout trực tiếp ở đây; để nơi gọi quyết định
      throw error;
    }
  }

  // POST /auth/logout
  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      // Dù API call thành công hay thất bại, đều clear localStorage
      this.clearAuthData();
      
      return response.ok;
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn clear localStorage ngay cả khi API call thất bại
      this.clearAuthData();
      return false;
    }
  }

  // Helper method để clear authentication data
  clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token'); // Xóa cả key 'token'
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Helper method để check xem user đã đăng nhập chưa
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  // Helper method để lấy user info
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Helper method để lấy access token (hỗ trợ cả hai key để tương thích)
  getAccessToken() {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  }
}

// Export singleton instance
export default new AuthService();
