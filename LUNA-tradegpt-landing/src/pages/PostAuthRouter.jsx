import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkspace } from '../services/api';

const PostAuthRouter = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        console.log('PostAuthRouter: Checking workspace...');
        const res = await getWorkspace();
        console.log('PostAuthRouter: Workspace response:', res);
        
        const list = Array.isArray(res?.data)
          ? res.data
          : res?.data
          ? [res.data]
          : [];

        if (list.length > 0) {
          const first = list[0];
          if (first?.id && !localStorage.getItem('selectedWorkspace')) {
            localStorage.setItem('selectedWorkspace', first.id);
            window.dispatchEvent(new Event('workspaceChanged'));
          }
          if (isMounted) navigate('/dashboard', { replace: true });
        } else {
          if (isMounted) navigate('/onboarding/create-workspace', { replace: true });
        }
      } catch (e) {
        console.error('PostAuthRouter: Error checking workspace:', e);
        // Thay vì navigate đến dashboard, thử navigate đến onboarding
        // vì có thể user chưa có workspace
        if (isMounted) navigate('/onboarding/create-workspace', { replace: true });
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center">
      <div className="text-white text-lg">Đang kiểm tra workspace của bạn...</div>
    </div>
  );
};

export default PostAuthRouter;


