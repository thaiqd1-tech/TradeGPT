/* eslint-disable */
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  Home,
  Users,
  CheckCircle,
  Settings as SettingsIcon,
  ChevronRight,
  Cpu,
  Folder,
  Book,
  Key,
  Calendar,
  MessageSquare,
  Clock,
  Trash,
  Gift,
  Building,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import './Sidebar.css';
import { useAuth } from '../../hooks/useAuth.jsx';
import { updateFolder, deleteFolder, clearAgentThreadHistory } from '../../services/api';
import { useSelectedWorkspace } from '../../hooks/useSelectedWorkspace';
import { useToast } from '../../components/ui/use-toast';
import { useFolders } from '../../contexts/FolderContext';
import React from 'react';
import gsap from 'gsap';
import { usePublicAgents } from '../../hooks/useAgentsByFolders';
import { useAIServiceAgents } from '../../hooks/useAIServiceAgents';
import { Agent, WorkspaceRole, WorkspacePermission } from '../../types/index';
// import { Agent as AIAgent } from '../../types/ai.types';
import { hasPermission } from '../../utils/workspacePermissions';
// import RunningTasksBadge from '../RunningTasksBadge';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../ui/input';

const Sidebar = React.memo(({ className, isMobileDrawer, userRole, onCloseSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { workspace } = useSelectedWorkspace();
  const { toast } = useToast();
  const { folders } = useFolders();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [agentIdToClear, setAgentIdToClear] = useState(null);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const isLoadingAgents = false;
  const isLoadingAIAgents = false;
  const errorAgents = null;
  const errorAIAgents = null;

  const asideRef = useRef(null);

  useEffect(() => {
    if (asideRef.current) {
      gsap.to(asideRef.current, {
        width: collapsed ? 64 : 256,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }
  }, [collapsed]);

  const menuItems = [
    { icon: Home, label: t('common.home'), path: '/dashboard', permission: 'view_workspace' },
    { icon: Calendar, label: t('common.scheduledTasks'), path: '/dashboard/scheduled-tasks', permission: 'view_workspace' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    // First check workspace permissions
    if (!hasPermission(userRole, item.permission)) {
      return false;
    }
    // Then check system role permissions
    if (item.label === 'Agents' && user?.role === 'user') {
      return false;
    }
    if (item.label === 'Tasks' && user?.role === 'user') {
      return false;
    }
    return true;
  });

  const [searchAgent, setSearchAgent] = useState('');

  // Mock data hoặc empty array để tránh lỗi ReferenceError
  const agents = [];
  const aiAgents = [];

  const filteredAgents = agents
    .filter(agent => {
      const nameMatch = agent.name.toLowerCase().includes(searchAgent.toLowerCase());
      const roleMatch = agent.role_description.toLowerCase().includes(searchAgent.toLowerCase());
      return nameMatch || roleMatch;
    })
    .sort((a, b) => {
      if (!a.last_message_time) return 1;
      if (!b.last_message_time) return -1;
      return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
    });

  const filteredAIAgents = (aiAgents || [])
    .filter(agent => {
      const nameMatch = agent.name.toLowerCase().includes(searchAgent.toLowerCase());
      const descMatch = agent.description.toLowerCase().includes(searchAgent.toLowerCase());
      return nameMatch || descMatch;
    });

  const handleOpenClearHistoryModal = (agentId) => {
    setAgentIdToClear(agentId);
    setShowClearHistoryDialog(true);
  };

  const handleClearHistory = async () => {
    if (!agentIdToClear || !workspace?.id) return;
    setIsClearingHistory(true);
    try {
      await clearAgentThreadHistory(agentIdToClear, workspace.id);
      toast({
        title: 'Success',
        description: 'Đã xóa lịch sử trò chuyện của agent!',
      });
      setShowClearHistoryDialog(false);
      setAgentIdToClear(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Xóa lịch sử trò chuyện thất bại!',
        variant: 'destructive',
      });
    } finally {
      setIsClearingHistory(false);
    }
  };

  const normalTasksCount = 0;

  return (
    <>
      {/* Overlay cho mobile, click để đóng sidebar */}
      {isMobileDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onCloseSidebar}
          aria-label={t('common.closeSidebar')}
        />
      )}
      <aside
        ref={asideRef}
        className={cn(
          isMobileDrawer
            ? "fixed inset-0 z-50 w-full max-w-xs h-full bg-background dark:bg-primary-white border-r border-border flex flex-col"
            : "flex flex-col h-screen overflow-hidden dark:bg-primary-white border-r border-border",
          className
        )}
      >
        {/* === HEADER (KHÔNG CUỘN) === */}
        {isMobileDrawer ? (
          <div className="flex items-center w-full px-4 py-3">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
              <span className="text-xl text-white">
                <span className="font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                  Trade
                </span>
                GPT
              </span>
          </div>
        ) : collapsed ? (
          <div className="flex gap-2 justify-center items-center h-20">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-xl">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <button
              className=" text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight className={cn('h-5 w-5 transition-transform')} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl text-white">
                <span className="font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                  Trade
                </span>
                GPT
              </span>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-auto"
              onClick={() => setCollapsed(true)}
            >
              <ChevronRight className={cn('h-5 w-5 transition-transform rotate-180')} />
            </button>
          </div>
        )}

        {/* === MENU ITEMS (KHÔNG CUỘN) === */}
        <nav className="p-2 space-y-1 border-b border-border dark:border-primary-white flex-shrink-0">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? (isDark ? 'button-gradient-dark text-white' : 'button-gradient-light text-white')
                    : 'text-muted-foreground ' + (isDark ? 'hover:button-gradient-dark hover:text-white' : 'hover:button-gradient-light hover:text-white')
                )
              }
              onClick={() => { if (isMobileDrawer && onCloseSidebar) onCloseSidebar(); }}
            >
              {item.icon && React.createElement(item.icon, { className: cn("sidebar-icon", !collapsed && "mr-2") })}
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>{item.label}</span>
                  {item.label === 'Tasks' && normalTasksCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-destructive text-white rounded-full">
                      {normalTasksCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>





      {/* Dialog xác nhận xóa lịch sử chat agent */}
      <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700 p-3 md:p-6 max-w-xs w-80 mx-auto">
          {/* MOBILE UI */}
          <div className="md:hidden flex flex-col items-center justify-center">
            <Trash className="h-6 w-6 text-destructive mb-0.5" />
            <DialogHeader className="w-full items-center text-center">
              <DialogTitle className="text-sm font-bold text-destructive">Xác nhận xóa lịch sử trò chuyện</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 mb-2">
                Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện với agent này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <div className="w-full flex flex-col gap-2 mt-1">
              <Button onClick={handleClearHistory} disabled={isClearingHistory} variant="destructive" className="w-full py-1.5 text-xs">
                {isClearingHistory ? 'Đang xóa...' : 'Xóa lịch sử'}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="w-full py-1.5 text-xs dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">Hủy</Button>
              </DialogClose>
            </div>
          </div>
          {/* DESKTOP UI giữ nguyên */}
          <div className="hidden md:block">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Xác nhận xóa lịch sử trò chuyện</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện với agent này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">Hủy</Button>
              </DialogClose>
              <Button onClick={handleClearHistory} disabled={isClearingHistory} variant="destructive">{isClearingHistory ? 'Đang xóa...' : 'Xóa lịch sử'}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default Sidebar;