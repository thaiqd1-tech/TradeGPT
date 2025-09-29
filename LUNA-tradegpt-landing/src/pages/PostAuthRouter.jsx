import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getWorkspace, createWorkspace } from '../services/api';

const PostAuthRouter = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
          // Prefer previously associated workspace from user profile if available
          const userStr = localStorage.getItem('user');
          let preferredWorkspaceId = null;
          try {
            if (userStr) {
              const parsedUser = JSON.parse(userStr);
              preferredWorkspaceId = parsedUser?.workspace?.id || null;
            }
          } catch (err) {
            console.error('PostAuthRouter: Failed to parse user from localStorage:', err);
          }

          const existingSelectedId = localStorage.getItem('selectedWorkspace');

          // If selectedWorkspace already set, keep it intact
          if (!existingSelectedId) {
            let chosenId = null;

            // If user has a workspace in profile and it's in the list, pick it
            if (preferredWorkspaceId && list.some(ws => ws.id === preferredWorkspaceId)) {
              chosenId = preferredWorkspaceId;
            } else {
              // Otherwise, prefer a non-default workspace over the default TradeGPT if multiple exist
              const nonDefault = list.find(ws => (ws?.name || '').toLowerCase() !== 'tradegpt');
              chosenId = (nonDefault?.id) || list[0]?.id || null;
            }

            if (chosenId) {
              localStorage.setItem('selectedWorkspace', chosenId);
              window.dispatchEvent(new Event('workspaceChanged'));
            }
          }

          if (isMounted) navigate('/dashboard', { replace: true });
        } else {
          // No workspace: auto-create default workspace "TradeGPT"
          try {
            const resCreate = await createWorkspace({
              name: 'TradeGPT',
              businessType: 'general',
              language: 'en',
              location: 'US',
              description: 'Default workspace for new users',
            });
            const wsId = resCreate?.data?.id;
            if (wsId) {
              localStorage.setItem('selectedWorkspace', wsId);
              window.dispatchEvent(new Event('workspaceChanged'));
              // Refresh workspaces cache
              queryClient.invalidateQueries({ queryKey: ['workspaces'] });
              // Navigate to the next onboarding step
              if (isMounted) navigate('/onboarding/company-website', { replace: true });
            } else {
              // If creation fails, fallback to manual create page
              if (isMounted) navigate('/onboarding/create-workspace', { replace: true });
            }
          } catch (err) {
            console.error('PostAuthRouter: Auto-create default workspace failed:', err);
            if (isMounted) navigate('/onboarding/create-workspace', { replace: true });
          }
        }
      } catch (e) {
        console.error('PostAuthRouter: Error checking workspace:', e);
        // Instead of going to dashboard, try onboarding
        // because the user may not have a workspace yet
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
      <div className="text-white text-lg">Checking your workspace...</div>
    </div>
  );
};

export default PostAuthRouter;


