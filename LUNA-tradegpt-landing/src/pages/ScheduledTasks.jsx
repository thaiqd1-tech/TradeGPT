import React from 'react';
import { ScheduledTasksManager } from '../components/ScheduledTasksManager';
import { RunningTasksBadge } from '../components/RunningTasksBadge';
import { Clock, Calendar, Zap } from 'lucide-react';
import { useScheduledTasks } from '../hooks/useScheduledTasks';
import Sidebar from '../components/Sidebar/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth.jsx';

const ScheduledTasksPage = () => {
  const { user } = useAuth();
  const { data: scheduledTasksData, isLoading } = useScheduledTasks();
  const scheduledTasks = scheduledTasksData?.data || [];
  const total = scheduledTasks.length;
  const active = scheduledTasks.filter(t => t.is_enabled).length;
  const inactive = scheduledTasks.filter(t => !t.is_enabled).length;

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
              <Calendar className="w-8 h-8" />
              Task theo lịch trình
              <RunningTasksBadge className="ml-2" />
            </h1>
            <p className="text-muted-foreground mt-2">
              Quản lý và tạo các task tự động chạy theo lịch trình định sẵn
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng số task</p>
              <p className="text-2xl font-bold text-white">{isLoading ? '-' : total}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold text-white">{isLoading ? '-' : active}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đã tắt</p>
              <p className="text-2xl font-bold text-white">{isLoading ? '-' : inactive}</p>
            </div>
          </div>
        </div>
      </div>

          {/* Main Content */}
          <ScheduledTasksManager />
        </main>
      </div>
    </div>
  );
};

export default ScheduledTasksPage;