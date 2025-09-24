/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button } from "../components/ui/button";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../hooks/useAuth";
import {
  Menu, X, LogOut, Clock, Bell, Users, Trash2, Puzzle,
  Share2, Loader2, Coins, Gift, CheckCircle2, AlertCircle,
  Info, PlayCircle, Building2, ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Avatar } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "../components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  acceptInvitation,
  rejectInvitation,
  getAllInvitations,
  getWorkspaceMembers,
  removeWorkspaceMember,
  getAgentById,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  getUserSubscription
} from "../services/api";
// Import types for JSDoc
// @typedef {import('../types/index').Notification} Notification
// @typedef {import('../types/index').Invitation} Invitation
// @typedef {import('../types/index').WorkspaceMember} WorkspaceMember
import { useAgentsByFolders } from "../hooks/useAgentsByFolders";
import { websocketService } from "../services/websocket";
import { WS_URL } from "../config/api";
import { toast } from "../hooks/use-toast";
// import './Header.css'; // CSS file not found
import { useSelectedWorkspace } from "../hooks/useSelectedWorkspace";
import { API_BASE_URL } from "../config/api";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { CreditPurchaseDialog } from "./CreditPurchaseDialog";
import RedeemGiftcodeDialog from "./RedeemGiftcodeDialog";
import { TransferOwnerDialog } from "./TransferOwnerDialog";
import { InviteMember } from "./InviteMember";

// TypeScript interfaces converted to JavaScript
/**
 * @typedef {Object} HeaderProps
 * @property {function} [onOpenSidebar] - Callback to open sidebar
 */

/**
 * @typedef {Invitation & Object} DetailedInvitation
 * @property {string} [WorkspaceName] - Workspace name
 * @property {string} [InviterEmail] - Inviter email
 */

const getNotificationIcon = (type) => {
  switch (type) {
    case 'scheduled_task_start':
      return <PlayCircle className="h-5 w-5 text-blue-500" />;
    case 'scheduled_task_complete':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'scheduled_task_error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'task_start':
      return <PlayCircle className="h-5 w-5 text-blue-500" />;
    case 'task_complete':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'task_error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'system':
      return <Info className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationStyle = (type) => {
  switch (type) {
    case 'scheduled_task_start':
    case 'task_start':
      return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    case 'scheduled_task_complete':
    case 'task_complete':
      return 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20';
    case 'scheduled_task_error':
    case 'task_error':
      return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20';
    case 'system':
      return 'border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950/20';
    default:
      return 'border-l-4 border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
  }
};

const formatNotificationTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return date.toLocaleDateString('vi-VN');
};

const Header = React.memo(({ onOpenSidebar }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user, logout, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);

  // Get current workspace and all workspaces
  const { workspace: currentWorkspace } = useSelectedWorkspace();

  // Get all workspaces for selection
  const { data: allWorkspacesData } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => fetch(`${API_BASE_URL}/workspaces`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()),
    enabled: !!user,
  });

  const allWorkspaces = allWorkspacesData?.data ?
    (Array.isArray(allWorkspacesData.data) ? allWorkspacesData.data : [allWorkspacesData.data]) : [];

  // Handle workspace selection
  const handleWorkspaceSelect = async (workspaceId) => {
    try {
      // Update localStorage first
      localStorage.setItem('selectedWorkspace', workspaceId);

      // Dispatch custom event to notify useSelectedWorkspace hook
      window.dispatchEvent(new Event('workspaceChanged'));

      // Close the dropdown immediately for better UX
      setShowWorkspaceSelector(false);

          // Show loading toast
      const loadingToast = toast.loading('Đang chuyển workspace...');

      // Invalidate all workspace-related queries to force refetch with new workspace
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
        queryClient.invalidateQueries({ queryKey: ['workspaceMembers'] }),
        queryClient.invalidateQueries({ queryKey: ['artifacts'] }),
        queryClient.invalidateQueries({ queryKey: ['groups'] }),
        queryClient.invalidateQueries({ queryKey: ['folders'] }),
        queryClient.invalidateQueries({ queryKey: ['workspaceProfile'] }),
        queryClient.invalidateQueries({ queryKey: ['workspaceUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({ queryKey: ['userInvitations'] }),
      ]);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Đã chuyển sang workspace: ${allWorkspaces.find(ws => ws.id === workspaceId)?.name}`);

    } catch (error) {
      console.error('Error switching workspace:', error);
      toast.error('Có lỗi khi chuyển workspace');
    }
  };

  // Queries
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const { data: invitationsData, isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['userInvitations'],
    queryFn: getAllInvitations,
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  // Computed values
  const unreadCount = notificationsData?.data?.filter(n => !n.is_read).length || 0;
  const totalUnread = unreadCount + (invitationsData?.data?.length || 0);

  const displayedNotifications = showAllNotifications
    ? notificationsData?.data
    : notificationsData?.data?.slice(0, 5);

  // Handlers
  const handleMarkAsRead = async (notificationId) => {
    if (loadingNotifications[notificationId]) return;

    // Optimistic update
    const previous = queryClient.getQueryData(['notifications']);
    queryClient.setQueryData(['notifications'], (oldData) => {
      if (!oldData || !oldData.data) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((n) => n.id === notificationId ? { ...n, is_read: true } : n)
      };
    });

    try {
      setLoadingNotifications(prev => ({ ...prev, [notificationId]: true }));
      await markNotificationAsRead(notificationId);
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('common.notificationMarkedAsRead'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Rollback
      if (previous) queryClient.setQueryData(['notifications'], previous);
      toast.error(t('common.errorMarkingNotificationAsRead'));
    } finally {
      setLoadingNotifications(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    const previous = queryClient.getQueryData(['notifications']);
    queryClient.setQueryData(['notifications'], (oldData) => {
      if (!oldData || !oldData.data) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((n) => ({ ...n, is_read: true }))
      };
    });

    try {
      await markAllNotificationsAsRead();
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('common.allNotificationsMarkedAsRead'));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      if (previous) queryClient.setQueryData(['notifications'], previous);
      toast.error(t('common.errorMarkingNotificationsAsRead'));
    }
  };

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const wsUrl = `${WS_URL}?token=${token}`;
    if (websocketService.getConnectionState() !== "open") {
      websocketService.connect(wsUrl);
    }

    const handleTaskStatus = (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleTaskUpdate = (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    // Use both helpers to ensure handlers registered
    websocketService.handleScheduledTaskStatus(handleTaskStatus);
    websocketService.handleScheduledTaskUpdate(handleTaskUpdate);

    return () => {
      websocketService.unsubscribe("status", handleTaskStatus);
      websocketService.unsubscribe("scheduled_task_update", handleTaskUpdate);
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (userDropdownOpen) {
      getUserSubscription()
        .then(sub => setSubscription(sub))
        .catch(() => setSubscription(null));
    }
  }, [userDropdownOpen]);

  const isHomePage = location.pathname === '/dashboard';
  const isAgentsPage = location.pathname.startsWith('/dashboard/agents');
  const isTasksPage = location.pathname.startsWith('/dashboard/tasks');
  const isScheduledTasksPage = location.pathname.startsWith('/dashboard/scheduled-tasks');
  const isKnowledgePage = location.pathname.startsWith('/dashboard/knowledge');
  const isSettingsPage = location.pathname.startsWith('/dashboard/settings');
  const isCredentialPage = location.pathname.startsWith('/dashboard/credential');
  const isFolderDetailPage = location.pathname.startsWith('/dashboard/folder/');

  const { workspace } = useSelectedWorkspace();
  const { agentId, folderId } = useParams();
  const isAIAgentRoute = location.pathname.includes('/ai-agents/');

  const { data: agentData } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => getAgentById(agentId),
    enabled: !!user && !!agentId && !isAIAgentRoute, // Disable for AI agents
  });

  const folderIds = folderId ? [folderId] : [];
  const { data: agentsByFoldersData } = useAgentsByFolders(folderIds, 1, 1);
  const folderInfo = agentsByFoldersData?.data?.[0];

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberToRemoveId, setMemberToRemoveId] = useState(null);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [showGiftcodeModal, setShowGiftcodeModal] = useState(false);
  const workspaceIdForMembers = workspace?.id || null;

  const { data: membersData, isLoading: isLoadingMembers, error: membersError } = useQuery({
    queryKey: ['workspaceMembers', workspaceIdForMembers],
    queryFn: () => getWorkspaceMembers(workspaceIdForMembers),
    enabled: !!user && !!workspaceIdForMembers && isMembersModalOpen,
  });

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await acceptInvitation(invitationId);
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      toast.success(t('common.invitationAccepted'));
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(t('common.errorAcceptingInvitation'));
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      await rejectInvitation(invitationId);
      queryClient.invalidateQueries({ queryKey: ['userInvitations'] });
      toast.success(t('common.invitationRejected'));
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error(t('common.errorRejectingInvitation'));
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemoveId || !workspace?.id) return;

    // Tìm member cần xóa và kiểm tra quyền hạn
    const member = membersData?.data?.find(m => m.user_id === memberToRemoveId);
    const currentUserMember = membersData?.data?.find(m => m.user_id === user?.id);

    if (!member || !currentUserMember) {
      toast.error('Không thể xác định thông tin thành viên');
      return;
    }

    // Kiểm tra quyền xóa member
    const canRemove = user?.id === workspace.owner_id ||
      (currentUserMember.role === 'admin' && member.role !== 'owner' && member.role !== 'admin');

    if (!canRemove) {
      toast.error('Bạn không có quyền xóa thành viên này');
      return;
    }

    // Nếu member bị xóa là owner, chuyển sang transfer ownership
    if (member.role === "owner") {
      toast.error('Không thể xóa owner. Vui lòng chuyển quyền sở hữu trước.');
      return;
    }

    try {
      await removeWorkspaceMember(workspace.id, memberToRemoveId);
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspace.id] });
      setIsRemoveMemberModalOpen(false);
      toast.success(t('common.memberRemoved'));
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(t('common.errorRemovingMember'));
    }
  };

  return (
    <header className="bg-background border-b border-border relative z-10">
      <div className="py-1.5 px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Nút menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={onOpenSidebar}
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </Button>


          {(() => {
            if (isHomePage) {
              return <div className="hidden md:block text-sm text-foreground">{t('common.dashboard')}</div>;
            }

            if (isAgentsPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage className="!text-gray-900 dark:!text-gray-100 font-medium">{t('common.agents')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isTasksPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage className="!text-gray-900 dark:!text-gray-100 font-medium">{t('common.tasks')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isScheduledTasksPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage className="!text-gray-900 dark:!text-gray-100 font-medium">{t('common.scheduledTasks')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isKnowledgePage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage className="!text-gray-900 dark:!text-gray-100 font-medium">{t('common.knowledge')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isSettingsPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage className="!text-gray-900 dark:!text-gray-100 font-medium">{t('common.settings')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isCredentialPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage className="!text-gray-900 dark:!text-gray-100 font-medium">{t('common.credential')}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            if (isFolderDetailPage) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage className="!text-gray-900 dark:!text-gray-100 font-medium">{folderInfo?.name}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            // Agent chat page breadcrumb
            if (agentId && agentData && !isAIAgentRoute) {
              return (
                <div className="hidden md:flex">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink asChild><Link to="/dashboard">{t('common.dashboard')}</Link></BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem><BreadcrumbPage className="!text-gray-900 dark:!text-gray-100 font-medium">{agentData.name}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              );
            }

            return <div className="hidden md:block text-sm text-foreground">{t('common.dashboard')}</div>;
          })()}
        </div>

        {/* --- RIGHT SECTION --- */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Nút chuông thông báo (Bell) + Dialog thông báo */}
          <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative !bg-transparent !text-foreground hover:!bg-transparent focus-visible:!ring-0"
                aria-label={t('common.notifications')}
                aria-live="polite"
                aria-atomic="true"
              >
                <Bell className="h-5 w-5" />
                {!isLoadingNotifications && !isLoadingInvitations && totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 !text-white rounded-full flex items-center justify-center text-xs animate-in fade-in duration-300">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[700px]">
              <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <DialogTitle className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent font-bold text-xl">
                      {t('Notifications')}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      {t('Notifications Description')}
                    </DialogDescription>
                  </div>
                {totalUnread > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2 mr-6"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {t('common.markAllAsRead')}
                  </Button>
                )}
              </div>

              <div className={cn(
                "py-4",
                showAllNotifications && "h-[500px] overflow-y-auto pr-4 no-scrollbar"
              )}>
                {isLoadingNotifications || isLoadingInvitations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : displayedNotifications && displayedNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {displayedNotifications.map((notification) => (
                      <TooltipProvider key={notification.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <button
                                type="button"
                                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                disabled={loadingNotifications[notification.id]}
                                className={cn(
                                  "w-full text-left p-4 rounded-lg flex items-start gap-3",
                                  getNotificationStyle(notification.type),
                                  "transition-all duration-200 ease-in-out",
                                  "hover:bg-accent/50",
                                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  "relative cursor-pointer",
                                  !notification.is_read && "font-medium",
                                  loadingNotifications[notification.id] && "opacity-70 cursor-wait",
                                  notification.is_read && "opacity-80"
                                )}
                              >
                                <div className="flex-shrink-0 mt-1 relative">
                                  {loadingNotifications[notification.id] ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    // Use icon by type
                                    getNotificationIcon(notification.type)
                                  )}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className="text-sm truncate">{notification.content}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground">
                                      {formatNotificationTime(notification.created_at)}
                                    </p>
                                    {!notification.is_read && (
                                      <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                                    )}
                                  </div>
                                  {/* Nếu là invitation, hiển thị 2 nút chấp nhận/từ chối */}
                                  {notification.type === "invitation" && !notification.is_read && (
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        size="sm"
                                        className="bg-green-600 text-white hover:bg-green-700"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          // Tìm invitation phù hợp từ invitationsData
                                          const invitation = invitationsData?.data?.find(inv =>
                                            inv.WorkspaceID === notification.workspace_id &&
                                            inv.InviteeEmail === user?.email &&
                                            inv.Status === "pending"
                                          );
                                          if (invitation) {
                                            await handleAcceptInvitation(invitation.ID);
                                            await handleMarkAsRead(notification.id); // Đánh dấu đã đọc
                                          } else {
                                            toast.error("Không tìm thấy lời mời phù hợp!");
                                          }
                                        }}
                                      >Chấp nhận</Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          // Tìm invitation phù hợp từ invitationsData
                                          const invitation = invitationsData?.data?.find(inv =>
                                            inv.WorkspaceID === notification.workspace_id &&
                                            inv.InviteeEmail === user?.email &&
                                            inv.Status === "pending"
                                          );
                                          if (invitation) {
                                            await handleRejectInvitation(invitation.ID);
                                            await handleMarkAsRead(notification.id); // Đánh dấu đã đọc
                                          } else {
                                            toast.error("Không tìm thấy lời mời phù hợp!");
                                          }
                                        }}
                                      >Từ chối</Button>
                                    </div>
                                  )}
                                </div>
                              </button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            {notification.is_read
                              ? t('common.alreadyRead')
                              : t('common.clickToMarkAsRead')
                            }
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}

                    {notificationsData?.data && notificationsData.data.length > 5 && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllNotifications(!showAllNotifications)}
                          className="min-w-[100px]"
                        >
                          {showAllNotifications
                            ? t('common.showLess')
                            : `${t('common.viewAll')} (${notificationsData.data.length})`
                          }
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    {t('common.noNotifications')}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Breadcrumb will be rendered here if needed */}
          <div className="flex items-center space-x-2">
            {/* Bộ chọn Workspace (Dropdown Building2) */}
            {allWorkspaces.length > 1 && (
              <DropdownMenu open={showWorkspaceSelector} onOpenChange={setShowWorkspaceSelector}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 max-w-[200px]">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">
                      {currentWorkspace?.name || 'Select Workspace'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[250px]">
                  {allWorkspaces.map((ws) => (
                    <DropdownMenuItem
                      key={ws.id}
                      onClick={() => handleWorkspaceSelect(ws.id)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        currentWorkspace?.id === ws.id && "bg-accent"
                      )}
                    >
                      <Building2 className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{ws.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {ws.description || 'No description'}
                        </span>
                      </div>
                      {currentWorkspace?.id === ws.id && (
                        <CheckCircle2 className="h-4 w-4 ml-auto text-green-600" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Nút Coins (mua Credit) - mở CreditPurchaseDialog */}
            <Button variant="ghost" size="icon" className="!bg-transparent !text-foreground hover:!bg-transparent focus-visible:!ring-0" onClick={() => setShowCreditPurchase(true)}>
              <Coins className="h-5 w-5 text-yellow-400" />
            </Button>
            {/* Hiển thị số credit hiện tại của user */}
            <span className="font-semibold text-yellow-400 text-sm min-w-[48px] text-center select-none">
              {user?.credit ?? 0}
            </span>
          </div>

          {/* Nút Gift (nhập Giftcode) - mở RedeemGiftcodeDialog */}
          <Button variant="outline" size="icon" className="!bg-transparent !text-foreground hover:!bg-transparent focus-visible:!ring-0" onClick={() => setShowGiftcodeModal(true)}>
            <Gift className="h-5 w-5" />
          </Button>

          {/* Nút đổi ngôn ngữ (LanguageToggle) */}
          <LanguageToggle />

          {/* Menu người dùng (Avatar dropdown) */}
          <DropdownMenu open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`}
                    alt="avatar"
                    className="rounded-full"
                  />
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex flex-col items-start">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
                {subscription?.plan?.name && (
                  <div className="text-xs text-purple-600 font-semibold mt-1">
                    Gói: {subscription.plan.name}
                  </div>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                logout();
              }} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('common.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog
        isOpen={showCreditPurchase}
        onClose={() => setShowCreditPurchase(false)}
        onSuccess={(newCredit) => updateUser({ ...(user || {}), credit: newCredit })}
      />

      {/* RedeemGiftcodeDialog */}
      <RedeemGiftcodeDialog
        open={showGiftcodeModal}
        onClose={() => setShowGiftcodeModal(false)}
        onSuccess={async (newCreditBalance) => {
          // Cập nhật local state trước để UX mượt
          updateUser({ ...(user || {}), credit: newCreditBalance });
          toast.success(`Credit hiện tại: ${newCreditBalance}`);
          
          // Fetch user data từ server để đảm bảo đồng bộ
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const response = await fetch(`${API_BASE_URL}/user/me`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              if (response.ok) {
                const userData = await response.json();
                if (userData.data) {
                  updateUser(userData.data);
                }
              }
            }
          } catch (error) {
            console.warn('Không thể refresh user data từ server:', error);
          }
        }}
      />
    </header>
  );
});

export default Header;
