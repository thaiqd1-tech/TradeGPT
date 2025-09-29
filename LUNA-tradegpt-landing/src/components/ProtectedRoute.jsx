import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requireWorkspace = true }) => {
  const { user, loading, hasWorkspace, isTokenExpired, refreshToken } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleTokenExpired = async () => {
      if (isTokenExpired && !isRefreshing) {
        setIsRefreshing(true);
        const success = await refreshToken();
        setIsRefreshing(false);
        if (!success) {
          // Nếu refresh thất bại, chuyển về landing page
          window.location.href = '/';
        }
      }
    };

    handleTokenExpired();
  }, [isTokenExpired, refreshToken]);

  if (loading || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teampal-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Workspace gating is handled via PostAuth onboarding flow; avoid redirecting to a non-existent /workspace route

  return <>{children}</>;
};

export default ProtectedRoute;