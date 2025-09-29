import { useQuery } from "@tanstack/react-query";
import { getWorkspace, WorkspaceResponse } from '../services/api';
import type { Workspace } from '../types';
import React, { useState, useEffect } from "react";

export const useSelectedWorkspace = (): {
  workspace: Workspace | null;
  isLoading: boolean;
  error: unknown;
} => {
  // Make selectedWorkspaceId reactive to localStorage changes
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("selectedWorkspace") : null
  );
  
  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newWorkspaceId = localStorage.getItem("selectedWorkspace");
      setSelectedWorkspaceId(newWorkspaceId);
    };
    
    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab localStorage changes
    window.addEventListener('workspaceChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('workspaceChanged', handleStorageChange);
    };
  }, []);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Sử dụng useQuery với cùng key của danh sách workspaces để truy cập cache
  // Hook này chỉ tìm kiếm trong dữ liệu đã fetch bởi query ['workspaces']
  const {
    data: workspacesData,
    isLoading: isWorkspacesLoading,
    error: workspacesError,
  } = useQuery<WorkspaceResponse | null>({
    queryKey: ["workspaces"], // Cùng key với fetch danh sách workspace
    queryFn: getWorkspace, // Vẫn cần queryFn dù có thể không fetch nếu cache có
    enabled: !!token, // Chỉ fetch khi đã đăng nhập
    staleTime: 5 * 60 * 1000, // Giữ data tươi trong cache
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
  });

  // Tìm workspace đang chọn từ dữ liệu danh sách
  const workspaces: Workspace[] = Array.isArray(workspacesData?.data)
    ? (workspacesData!.data as Workspace[])
    : [];

  const workspace: Workspace | null = workspaces.find(
    (ws) => ws.id === selectedWorkspaceId
  ) || null;

  // Memoize the returned value to prevent unnecessary re-renders
  const memoizedValue = React.useMemo(
    () => ({
      workspace,
      isLoading: isWorkspacesLoading,
      error: workspacesError,
    }),
    [workspace, isWorkspacesLoading, workspacesError]
  );

  // Trả về thông tin workspace đang chọn và trạng thái loading/error từ query danh sách
  return memoizedValue;
};
