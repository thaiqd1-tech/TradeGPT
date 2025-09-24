import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMembers } from '../services/api';
import { useSelectedWorkspace } from 'useSelectedWorkspace';

export function useWorkspaceMembers() {
  const { workspace } = useSelectedWorkspace();
  const workspaceId = workspace?.id;
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => (workspaceId ? getWorkspaceMembers(workspaceId) : Promise.resolve({ data: [] })),
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
  });

  return {
    members: data?.data || [],
    isLoading,
    error,
    refetch,
  };
}
