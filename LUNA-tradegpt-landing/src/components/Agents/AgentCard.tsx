import { Button } from "../ui/button";
import { MoreVertical, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useNavigate } from "react-router-dom";
import { Agent } from "../../types/index";
import React from "react";

interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  jobCount?: number;
  runningCount?: number;
  successfulRuns?: number;
  totalJobs?: number;
  isRunning?: boolean;
  isScheduled?: boolean;
}

export const AgentCard = ({ agent, onEdit, onDelete }: AgentCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg flex flex-col
                 p-5 min-h-[250px] max-h-[250px] max-w-[320px] w-full mx-auto
                 hover:bg-slate-900/80 hover:border-blue-500/40 hover:-translate-y-1 group relative transition-all duration-200"
    >
      {/* Dropdown menu */}
      {(onEdit || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-3 right-3 p-1 rounded-full hover:bg-accent/50 focus:outline-none">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(agent)}>
                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(agent)}>
                <Trash className="mr-2 h-4 w-4 text-destructive" /> Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Avatar + Name + Position */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-12 h-12 rounded-full border-2 border-blue-400 overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
          {agent.avatar ? (
            <div
              dangerouslySetInnerHTML={{
                __html: agent.avatar,
              }}
              style={{ 
                width: 48, 
                height: 48, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '50%'
              }}
            />
          ) : (
            <div className="w-8 h-8 text-white font-bold text-lg flex items-center justify-center">
              {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <div
            className="font-semibold text-base truncate max-w-[200px] text-slate-100"
            title={agent.name}
          >
            {agent.name}
          </div>
          {agent.position && (
            <div className="text-xs text-slate-400 truncate max-w-[200px]" title={agent.position}>
              {agent.position}
            </div>
          )}
        </div>
      </div>

      {/* Job brief */}
      <div className="flex-1 mb-2 mt-1 flex items-start">
        <div className="text-xs text-slate-300 line-clamp-5 min-h-[45px] w-full break-words leading-relaxed">
          {agent.job_brief && agent.job_brief.trim() !== ''
            ? agent.job_brief
            : <span className="italic text-slate-500">Chưa có mô tả công việc</span>
          }
        </div>
      </div>

      {/* Job stats */}
      <div className="mb-2 space-y-0.5">
        <span className="text-xs font-medium text-green-400 block">
          Đã thực thi: {agent.successful_runs !== undefined ? agent.successful_runs : '-'} lần
        </span>
        <span className="text-xs font-medium text-slate-400 block">
          Tổng số job: {agent.total_runs !== undefined ? agent.total_runs : '-'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          className="flex-1 border border-slate-600 text-slate-200 bg-transparent hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-lg py-2 text-xs font-medium transition-all duration-200"
          onClick={() => navigate(`/dashboard/agents/${agent.id}?fromProfile=true`)}
        >
          Chat
        </Button>
        <Button
          className="flex-1 border border-slate-600 text-slate-200 bg-transparent hover:bg-slate-700 hover:text-white hover:border-slate-500 rounded-lg py-2 text-xs font-medium transition-all duration-200"
          onClick={() => navigate(`/dashboard/agents/${agent.id}/profile`)}
        >
          Profile
        </Button>
      </div>
    </div>
  );
};
