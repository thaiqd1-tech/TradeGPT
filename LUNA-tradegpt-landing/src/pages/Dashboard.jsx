/* eslint-disable */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

import { Agent, Folder } from "../types/index";

import { useState } from 'react';
// Removed Pagination imports
import AgentDialog from '../components/AgentDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { updateFolder, deleteFolder, createAgent   } from '../services/api';
import { useSelectedWorkspace } from '../hooks/useSelectedWorkspace';
import { useToast } from '../components/ui/use-toast';
import { useFolders } from '../contexts/FolderContext';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth.jsx';
import React from 'react';
import { useTranslation } from "react-i18next";

import { usePublicAgents, useAgentsByFolders } from '../hooks/useAgentsByFolders';
import { AgentCard } from "../components/Agents/AgentCard";
import AgentCardSkeleton from "../components/skeletons/AgentCardSkeleton";
import { useDebounce } from 'use-debounce';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';
import DevelopmentNoticeModal from '../components/shared/DevelopmentNoticeModal';
import Sidebar from '../components/Sidebar/Sidebar';
import DashboardHeader from '../components/DashboardHeader';

const Dashboard = () => {
  const { theme } = useTheme();
  const { folders } = useFolders();
  const { workspace } = useSelectedWorkspace();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12); // 4 cột x 3 hàng, có thể chỉnh nếu muốn

  const { t } = useTranslation();
  // State để lưu agents và phân trang
  const isAllAgents = selectedFolderId === 'all' || selectedFolderId == null;
  const {
    data: publicAgentsData,
    isLoading: isLoadingPublicAgents,
    error: errorPublicAgents
  } = usePublicAgents(page, pageSize, debouncedSearchTerm);
  const {
    data: byFoldersData,
    isLoading: isLoadingByFolders,
    error: errorByFolders
  } = useAgentsByFolders(
    isAllAgents ? [] : [selectedFolderId],
    page,
    pageSize,
    debouncedSearchTerm ? { search: debouncedSearchTerm } : undefined
  );

  // Lấy agents và phân trang phù hợp (theo trang hiện tại)
  let agents = [];
  let pagination = undefined;
  let isLoadingAgents = false;
  if (isAllAgents) {
    agents = Array.isArray(publicAgentsData?.data?.data) ? publicAgentsData.data.data : [];
    pagination = publicAgentsData?.data?.pagination;
    isLoadingAgents = isLoadingPublicAgents;
  } else {
    // byFoldersData.data là mảng các folder, mỗi folder có agents
    const folderAgents = Array.isArray(byFoldersData?.data)
      ? byFoldersData.data.find((f) => f.id === selectedFolderId)
      : undefined;
    agents = Array.isArray(folderAgents?.agents) ? folderAgents?.agents || [] : [];
    // Lấy pagination đúng từ folderAgents
    pagination = folderAgents?.pagination;
    isLoadingAgents = isLoadingByFolders;
  }
  // Sử dụng dữ liệu thật từ API
  
  // ====== Fetch toàn bộ agents qua phân trang để lọc chính xác ======
  const [allAgents, setAllAgents] = useState([]);
  const [isLoadingAllAgents, setIsLoadingAllAgents] = useState(false);
  const [allAgentsError, setAllAgentsError] = useState(null);

  const fetchAllPublicAgents = React.useCallback(async (search = "") => {
    let currentPage = 1;
    const fetchPageSize = 100;
    const aggregated = [];
    while (true) {
      const res = await import('../services/api').then(m => m.getPublicAgents(currentPage, fetchPageSize, search));
      const items = Array.isArray(res?.data?.data) ? res.data.data : [];
      aggregated.push(...items);
      const totalPages = res?.data?.pagination?.total_pages || 1;
      if (currentPage >= totalPages) break;
      currentPage += 1;
    }
    return aggregated;
  }, []);

  const fetchAllAgentsByFolders = React.useCallback(async (folderIds = [], search = "") => {
    let currentPage = 1;
    const fetchPageSize = 100;
    const aggregated = [];
    while (true) {
      const res = await import('../services/api').then(m => m.getAgentsByFolders(folderIds, currentPage, fetchPageSize, search ? { search } : undefined));
      const folders = Array.isArray(res?.data) ? res.data : [];
      for (const f of folders) {
        if (Array.isArray(f?.agents)) aggregated.push(...f.agents);
      }
      const done = folders.every(f => (f?.pagination?.page || 1) >= (f?.pagination?.total_pages || 1));
      if (done) break;
      currentPage += 1;
    }
    return aggregated;
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setIsLoadingAllAgents(true);
        setAllAgentsError(null);
        if (!workspace?.id) {
          setAllAgents([]);
          return;
        }
        const data = isAllAgents
          ? await fetchAllPublicAgents(debouncedSearchTerm || "")
          : await fetchAllAgentsByFolders([selectedFolderId], debouncedSearchTerm || "");
        if (!cancelled) setAllAgents(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setAllAgentsError(e instanceof Error ? e.message : 'Failed to fetch all agents');
        if (!cancelled) setAllAgents([]);
      } finally {
        if (!cancelled) setIsLoadingAllAgents(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [workspace?.id, isAllAgents, selectedFolderId, debouncedSearchTerm, fetchAllPublicAgents, fetchAllAgentsByFolders]);
  // ====== End fetch-all ======
  
  // Log toàn bộ agents trước khi lọc để kiểm tra
  try {
    const source = allAgents?.length ? allAgents : agents;
    // (logs removed as requested earlier)
  } catch (_) {}

  // Chỉ hiển thị 4 agents mong muốn (chuẩn hóa tên: trim + lowercase)
  const allowedAgentNames = new Set(["forexis", "cris", "stosi", "etfs"]);
  const sourceAgents = allAgents?.length ? allAgents : agents;
  const filteredAgents = Array.isArray(sourceAgents)
    ? sourceAgents.filter((agent) => {
        const normalized = (agent?.name || '').trim().toLowerCase();
        return allowedAgentNames.has(normalized);
      })
    : [];

  try {
    // (logs removed)
  } catch (_) {}
  
  // Removed: Calculate pagination from API data (no longer used)
  // const totalPages = pagination?.total_pages || 1;
  // const currentPage = pagination?.page || page;
  
  // Handle API errors
  const hasError = errorPublicAgents || errorByFolders;
  const errorMessage = errorPublicAgents?.message || errorByFolders?.message || 'Có lỗi xảy ra khi tải danh sách agents';
  
  // Auto-select workspace if not set
  React.useEffect(() => {
    if (workspace?.id && !localStorage.getItem("selectedWorkspace")) {
      localStorage.setItem("selectedWorkspace", workspace.id);
      // console.log removed
    }
  }, [workspace?.id]);
  
  // Debug logging removed

  // Reset về trang 1 khi searchTerm thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);


  const handleAddAgent = async (data) => {
    await createAgent({
      name: data.name || '',
      workspace_id: workspace?.id || '',
      folder_id: data.folder_id || '',
      role_description: data.role_description || '',
      job_brief: data.job_brief || '',
      language: data.language || '',
      position: data.position || '',
      status: data.status || 'private',
      greeting_message: data.greeting_message || '',
      model_config: { webhook_url: data.model_config?.webhook_url || '' },
    });
    queryClient.invalidateQueries({ queryKey: ['agents'] });
    toast({
      title: t('common.success'),
      description: t('agent.agentCreated', { name: data.name }),
    });
    setShowAddAgentDialog(false);
  }

 

  // Lấy tất cả các vị trí (position) có trong agents để làm filter
  const allPositions = React.useMemo(() => {
    const positions = new Set();
    (filteredAgents || []).forEach(agent => {
      if (agent?.position) positions.add(agent.position);
    });
    return Array.from(positions);
  }, [filteredAgents]);

  // Không cần filter FE nữa, BE đã trả về đúng kết quả

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        className="w-64 flex-shrink-0"
        userRole={user?.role || 'member'}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <DevelopmentNoticeModal />

          {/* Dashboard Title & Description */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('common.dashboard')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('common.dashboardDescription')}
            </p>
          </div>

      {/* Search & Filter UI */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder={t('common.searchAgent')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="sm:w-64 bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Folder Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          className={cn(
            "cursor-pointer transition-all ease-in-out transform hover:scale-105 glossy-black-card rounded-2xl shadow-md px-3 py-1",
            isAllAgents ? "!bg-blue-600 !text-white scale-110" : "!bg-gray-800 !text-gray-300 hover:!bg-blue-600 hover:!text-white"
          )}
          onClick={() => { setSelectedFolderId('all'); setPage(1); }}
        >
          {t('common.all')}
        </Badge>
        {folders?.map(folder => (
          <Badge
            key={folder.id}
            className={cn(
              "cursor-pointer transition-all ease-in-out transform hover:scale-105 glossy-black-card rounded-2xl shadow-md px-3 py-1",
              selectedFolderId === folder.id ? "!bg-blue-600 !text-white scale-110" : "!bg-gray-800 !text-gray-300 hover:!bg-blue-600 hover:!text-white"
            )}
            onClick={() => { setSelectedFolderId(folder.id); setPage(1); }}
          >
            {folder.name}
          </Badge>
        ))}
      </div>

      <div>
        {/* Error display */}
        {hasError && (
          <div className="text-red-500 text-center w-full py-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="font-medium">Lỗi tải danh sách agents</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        )}
        
        {/* No workspace warning */}
        {!workspace?.id && !hasError && (
          <div className="text-yellow-600 text-center w-full py-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="font-medium">Chưa có workspace</p>
            <p className="text-sm mt-1">Vui lòng tạo hoặc chọn workspace để xem agents</p>
          </div>
        )}
        
        {/* Skeleton khi loading */}
        {!hasError && workspace?.id && (isLoadingAgents || isLoadingAllAgents) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: pageSize }).map((_, idx) => (
              <AgentCardSkeleton key={idx} />
            ))}
          </div>
        ) : !hasError && workspace?.id && filteredAgents.length === 0 ? (
          <div className="text-muted-foreground text-center w-full py-8">
            No agents found
          </div>
        ) : !hasError && workspace?.id ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
            {/* Pagination UI removed */}
          </>
        ) : null}
      </div>

      {/* Dialogs */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('folder.renameFolder')}</DialogTitle>
            <DialogDescription>
              {t('folder.renameFolderDescription', { name: folderToRename?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-folder-name" className="text-right">
                {t('folder.newFolderName')}
              </Label>
              <Input
                id="new-folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                disabled={isRenaming}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)} disabled={isRenaming}>{t('common.cancel')}</Button>
            <Button disabled={!newFolderName.trim() || isRenaming}>
              {isRenaming ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AgentDialog open={showAddAgentDialog} onOpenChange={setShowAddAgentDialog} folderId={selectedFolderId} mode="add" onSave={handleAddAgent} onCancel={() => setShowAddAgentDialog(false)} />

      <Dialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('folder.deleteFolder')}</DialogTitle>
            <DialogDescription>
              {t('folder.deleteFolderDescription', { name: folderToDelete?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDeleteDialog(false)} disabled={isDeleting}>{t('common.cancel')}</Button>
            <Button variant="destructive" disabled={isDeleting}>
               {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
