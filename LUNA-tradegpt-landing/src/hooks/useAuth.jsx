import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const queryClient = useQueryClient();

  const checkTokenExpiration = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) return false;

      const res = await fetch(API_ENDPOINTS.auth.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: storedRefreshToken
        })
      });

      const data = await res.json();

      if (data.success && res.ok) {
        const token = data.token || data.access_token;
        
        if (token && data.refresh_token) {
          localStorage.setItem('token', token);
          localStorage.setItem('refresh_token', data.refresh_token);
          
          if (data.user) {
            const existingUserStr = localStorage.getItem('user');
            let existingUserData = {};
            if (existingUserStr) {
              try {
                existingUserData = JSON.parse(existingUserStr);
              } catch (e) {
                console.error("Failed to parse existing user data from localStorage:", e);
              }
            }

            const mergedUserData = { ...existingUserData, ...data.user };
            
            try {
              const decodedToken = jwtDecode(token);
              mergedUserData.role = decodedToken.role;
            } catch (e) {
              console.error("Failed to decode token for role:", e);
              mergedUserData.role = null;
            }
            localStorage.setItem('user', JSON.stringify(mergedUserData));
            setUser(mergedUserData);
          }
          
          setIsTokenExpired(false);
          return true;
        } else {
          console.error('Refresh token response missing required fields:', { token, refresh_token: data.refresh_token });
          logout();
          return false;
        }
      } else {
        console.error('Refresh token failed:', data);
        logout();
        return false;
      }
    } catch (err) {
      console.error('Lỗi khi refresh token:', err);
      logout();
      return false;
    }
  };

  const checkAndRefreshToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;

      if (timeUntilExpiry < 300) {
        console.log('Token sắp hết hạn, đang cố gắng refresh...');
        await refreshToken();
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra token để refresh:', err);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const isExpired = checkTokenExpiration(token);
        setIsTokenExpired(isExpired);
        
        if (isExpired) {
          const success = await refreshToken();
          if (!success) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          const userData = JSON.parse(userStr);
          try {
            const decodedToken = jwtDecode(token);
            userData.role = decodedToken.role;
          } catch (e) {
            console.error("Failed to decode token for role:", e);
            userData.role = null;
          }
          setUser(userData);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    const interval = setInterval(checkAndRefreshToken, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
      
      const token = data.token || data.access_token;
      
      if (token && data.refresh_token && data.user) {
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        try {
          const decodedToken = jwtDecode(token);
          data.user.role = decodedToken.role;
        } catch (e) {
          console.error("Failed to decode token for role:", e);
          data.user.role = null;
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsTokenExpired(false);
        
        queryClient.invalidateQueries();
      } else {
        throw new Error('Không nhận được token hoặc user từ server');
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (navigate) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const token = localStorage.getItem('token');
      if (refreshToken && token) {
        await fetch(API_ENDPOINTS.auth.logout, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (err) {
      console.error('Lỗi khi logout:', err);
    } finally {
      queryClient.clear();
      
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedWorkspace');
      
      setUser(null);
      setIsTokenExpired(false);
      if (navigate) navigate("/", { replace: true });
    }
  };

  const updateUser = (newUser) => {
    setUser(newUser);
    const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...newUser };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const hasWorkspace = Boolean(user?.workspace?.id);
  const canCreateAgent = user?.role !== 'user';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      updateUser, 
      hasWorkspace,
      isTokenExpired,
      refreshToken,
      role: user?.role,
      canCreateAgent,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};