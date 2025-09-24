import { getWorkspaceMembers } from '../services/api';
import { artifactService } from '../services/artifactService';
import { useState, useEffect } from 'react';

export interface WorkspaceUser {
  user_id: string;
  user_name: string;
  user_email?: string;
}

export const useWorkspaceUsers = (workspaceId: string) => {
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await getWorkspaceMembers(workspaceId);
        setUsers(res.data);
        console.log(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [workspaceId]);

  return { users, loading, error };
};
