import { useState, useEffect, createContext, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [intervalId, setIntervalId] = useState(null);

  const checkTokenExpiration = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  const checkAndRefreshToken = async () => {
    const token = authService.getAccessToken();
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      if (timeUntilExpiry < 300) {
        await authService.refreshToken();
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra token để refresh:', err);
      // Nếu lỗi decode hoặc refresh thất bại ở đây, tiến hành logout
      logout();
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = () => {
      try {
        const token = authService.getAccessToken();
        const userData = authService.getCurrentUser();
        
        if (token && userData) {
          const expired = checkTokenExpiration(token);
          if (expired) {
            // Nếu đã hết hạn, thử refresh ngay
            authService.refreshToken()
              .then((res) => {
                setUser(userData);
                setIsAuthenticated(true);
              })
              .catch(() => {
                authService.clearAuthData();
                setUser(null);
                setIsAuthenticated(false);
              })
              .finally(() => setIsLoading(false));
            return;
          } else {
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else {
          // Clear any invalid data
          authService.clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        authService.clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    // Thiết lập interval kiểm tra token mỗi 60s
    const id = setInterval(checkAndRefreshToken, 60000);
    setIntervalId(id);
    return () => {
      if (id) clearInterval(id);
    };
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const result = await authService.login(email, password);
      
      setUser(result.user);
      setIsAuthenticated(true);
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setIsLoading(true);
      const result = await authService.register(email, password, name);
      
      // Không set user ngay lập tức vì cần verify email trước
      // setUser(result.user);
      // setIsAuthenticated(true);
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      setIsLoading(true);
      const result = await authService.verifyEmail(email, code);
      
      setUser(result.user);
      setIsAuthenticated(true);
      
      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    try {
      setIsLoading(true);
      const result = await authService.googleLogin(idToken);
      
      // Đồng bộ role từ token để UI hoạt động đúng
      try {
        const token = authService.getAccessToken();
        if (token && result && result.user) {
          const decoded = jwtDecode(token);
          const role = decoded && decoded.role ? decoded.role : result.user.role;
          const mergedUser = { ...result.user, role };
          // Lưu lại user đã có role
          try {
            localStorage.setItem('user', JSON.stringify(mergedUser));
          } catch (_) {}
          setUser(mergedUser);
        } else if (result && result.user) {
          setUser(result.user);
        }
      } catch (e) {
        // Nếu decode lỗi, fallback dùng user trả về
        setUser(result.user);
      }
      setIsAuthenticated(true);
      
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const result = await authService.refreshToken();
      // Nếu backend trả user mới, cập nhật lại
      if (result && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifyEmail,
    googleLogin,
    logout,
    refreshToken,
    updateUser: (newUser) => {
      try {
        const existing = localStorage.getItem('user');
        const existingUser = existing ? JSON.parse(existing) : {};
        const merged = { ...existingUser, ...newUser };
        localStorage.setItem('user', JSON.stringify(merged));
        setUser(merged);
        setIsAuthenticated(true);
      } catch (_) {
        setUser(newUser);
        setIsAuthenticated(true);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
