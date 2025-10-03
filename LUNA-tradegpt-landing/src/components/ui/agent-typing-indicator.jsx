import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { BrainCircuit, ChevronDown, ChevronUp, Zap, CheckCircle, Clock } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";
import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogMessage } from '../LogAgentThinking';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const AgentTypingIndicator = memo(
  ({ agentName, agentAvatar, subflowLogs = [], showProcessing = true }) => {
    const containerRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useTranslation();

    // Auto-scroll khi có log mới
    useEffect(() => {
      if (containerRef.current && subflowLogs.length > 0) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, [subflowLogs]);

    const handleToggleExpand = () => setIsExpanded((prev) => !prev);

    // Enhanced LogMessage component with better styling
    const EnhancedLogMessage = ({ log, isCollapsed = false }) => {
      const isResult = !!log.is_result || String(log?.log_type || '').toLowerCase() === 'result';
      const content = log.content || log.log_message || '';
      const isLongContent = content.length > 150;
      const [isExpanded, setIsExpanded] = useState(false);

      const displayContent = isExpanded || !isLongContent ? content : content.substring(0, 150) + '...';

      return (
        <div className={`relative group ${isResult ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'}`}>
          <div className={`
            rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md
            ${isResult 
              ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/50 text-green-100' 
              : 'bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-blue-500/50 text-blue-100'
            }
            ${isCollapsed ? 'p-2 text-xs' : 'p-3 text-sm'}
          `}>
            {/* Header with icon and timestamp */}
            <div className="flex items-center gap-2 mb-2">
              {isResult ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Zap className="w-4 h-4 text-blue-400" />
              )}
              <span className={`text-xs font-semibold ${isResult ? 'text-green-300' : 'text-blue-300'}`}>
                {isResult ? 'RESULT' : 'EXECUTING'}
              </span>
              {log.timestamp && (
                <span className="text-xs text-slate-400 ml-auto">
                  {new Date(log.timestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="whitespace-pre-line break-words">
              {isResult ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-sm max-w-none">
                  {displayContent}
                </ReactMarkdown>
              ) : (
                <span>{displayContent}</span>
              )}
            </div>

            {/* Expand/Collapse button for long content */}
            {isLongContent && !isCollapsed && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`absolute -top-2 -right-2 z-10 h-6 w-6 flex items-center justify-center rounded-full text-xs transition-all duration-200 hover:scale-110 ${
                  isResult 
                    ? 'bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 text-green-700 dark:text-green-300' 
                    : 'bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300'
                }`}
                aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>
      );
    };

    // Hàm để chọn nội dung hiển thị dựa trên subflow logs hoặc stage
    const getIndicatorContent = () => {
      // Hiển thị subflow log nếu có
      if (subflowLogs.length > 0) {
        const latestLog = subflowLogs[subflowLogs.length - 1];

        return (
          <div className="relative mt-1 w-full max-w-full">
            <div
              className={`
                rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 
                backdrop-blur-sm border border-blue-500/30 p-4 space-y-3
                ${isExpanded ? "max-h-96" : "max-h-[20rem]"} 
                overflow-y-auto no-scrollbar
                shadow-lg hover:shadow-xl transition-all duration-300
              `}
            >
              {/* Header with enhanced styling */}
              <div className="flex items-center justify-between gap-2 text-sm text-blue-400 font-semibold mb-3 sticky top-0 bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 -m-2">
                <span className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-400 animate-pulse" />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {t("agent_chat.log_agent_thinking")}
                  </span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    {subflowLogs.length} steps
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-blue-500/20 transition-all duration-200 hover:scale-110"
                  aria-label={isExpanded ? "Thu gọn log" : "Mở rộng log"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-blue-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-400" />
                  )}
                </button>
              </div>

              {/* Logs display */}
              {isExpanded && (
                <div className="space-y-3">
                  {subflowLogs.map((log, idx) => (
                    <div key={`${log.timestamp || idx}`} className="animate-fade-in">
                      <EnhancedLogMessage log={log} isCollapsed={false} />
                    </div>
                  ))}
                </div>
              )}


              {/* Enhanced thinking animation */}
              {showProcessing && (() => {
                const latestLog = subflowLogs[subflowLogs.length - 1];
                const content = latestLog?.content?.toLowerCase() || "";
                const isDone = [
                  "done", "success", "hoàn thành", "kết thúc", "thành công", 
                  "completed", "finish", "complete", "finished"
                ].some((k) => content.includes(k));
                
                if (!isDone) {
                  return (
                    <div className="flex items-center space-x-3 mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="text-sm font-semibold text-blue-300">
                        Processing...
                      </span>
                      <div className="flex space-x-1">
                        <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        );
      }

      // Enhanced default thinking indicator
      return (
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-sm font-semibold text-blue-300">
              {t("agent_chat.thinking") || "Thinking"}
            </span>
          </div>
          <div className="flex space-x-1">
            <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
          </div>
        </div>
      );
    };

    return (
      <div className="flex items-end justify-start animate-fade-in py-2">
        <div className="h-10 w-10 md:h-11 md:w-11 mx-3 flex-shrink-0 flex items-center justify-center">
          {agentAvatar ? (
            <div
              dangerouslySetInnerHTML={{ __html: agentAvatar }}
              className="rounded-full border-2 border-blue-500/30 shadow-lg"
              style={{ width: 40, height: 40 }}
            />
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: createAvatar(adventurer, {
                  seed: agentName || "Agent",
                }).toString(),
              }}
              className="rounded-full border-2 border-blue-500/30 shadow-lg"
              style={{ width: 40, height: 40 }}
            />
          )}
        </div>
        <div className="max-w-[80%] p-4 rounded-2xl shadow-lg bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-blue-500/30 transition-all duration-300">
          {getIndicatorContent()}
        </div>
      </div>
    );
  }
);

AgentTypingIndicator.displayName = "AgentTypingIndicator";