import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { BrainCircuit, ChevronDown, ChevronUp } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";
import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogMessage } from '../LogAgentThinking';

interface SubflowLog {
  type: "subflow_log";
  thread_id: string;
  content: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

interface AgentTypingIndicatorProps {
  agentName?: string | null;
  agentAvatar?: string | null;
  subflowLogs?: SubflowLog[]; // Thêm prop mới cho subflow logs
}

export const AgentTypingIndicator = memo(
  ({ agentName, agentAvatar, subflowLogs = [] }: AgentTypingIndicatorProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useTranslation();
    // Auto-scroll khi có log mới
    useEffect(() => {
      if (containerRef.current && subflowLogs.length > 0) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, [subflowLogs]);

    const handleToggleExpand = () => setIsExpanded((prev) => !prev);

    // Hàm để chọn nội dung hiển thị dựa trên subflow logs hoặc stage
    const getIndicatorContent = () => {
      // Hiển thị subflow log nếu có
      if (subflowLogs.length > 0) {
        const latestLog = subflowLogs[subflowLogs.length - 1];

        // Format timestamp
        const formatTime = (timestamp: string) => {
          try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          } catch {
            return "";
          }
        };

        return (
          <div className="relative mt-1 w-full max-w-full">
            <div
              className={
                "rounded-xl bg-slate-900/60 border border-blue-500/30 p-3 space-y-2 " +
                (isExpanded ? "max-h-96" : "max-h-[30rem]") +
                " overflow-y-auto no-scrollbar"
              }
            >
              <div className="flex items-center justify-between gap-2 text-xs text-blue-500 font-semibold mb-1">
                <span className="flex items-center">
                  <BrainCircuit
                    className="w-4 h-4 mr-1"
                    style={{ marginTop: 2 }}
                  />
                  {t("agent_chat.log_agent_thinking")}
                </span>

                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition"
                  aria-label={isExpanded ? "Thu gọn log" : "Mở rộng log"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              {(isExpanded ? subflowLogs : subflowLogs.slice(-2)).map(
                (log, idx) => (
                  <div
                    key={`${log.timestamp || idx}`}
                    className="flex items-start gap-2 text-xs"
                  >
                    <LogMessage log={log} />
                  </div>
                )
              )}
              {!isExpanded && subflowLogs.length > 2 && (
                <div
                  className="text-xs text-blue-500 cursor-pointer underline"
                  onClick={() => setIsExpanded(true)}
                >
                  {t("agent_chat.show_all_steps", {
                    count: subflowLogs.length,
                  })}
                </div>
              )}
              {/* Hiệu ứng ba chấm nhảy nếu log cuối chưa phải kết quả */}
              {(() => {
                const latestLog = subflowLogs[subflowLogs.length - 1];
                const content = latestLog?.content?.toLowerCase() || "";
                // Có thể tùy chỉnh thêm các từ khóa kết thúc
                const isDone = [
                  "done",
                  "success",
                  "hoàn thành",
                  "kết thúc",
                  "thành công",
                  "completed",
                  "finish",
                ].some((k) => content.includes(k));
                if (!isDone) {
                  return (
                    <div
                      className="flex items-center space-x-2 mt-1 ml-6"
                      aria-label="Agent is thinking"
                    >
                      <span className="text-xs font-semibold text-blue-400 mr-2">
                        Thinking
                      </span>
                      <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        );
      }

      // Mặc định chỉ hiển thị icon "..." khi chưa có subflow logs
      return (
        <div
          className="flex items-center space-x-2"
          aria-label="Agent is thinking"
        >
          <span className="text-xs font-semibold text-blue-400 mr-2">
            Thinking
          </span>
          <span className="h-1 w-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="h-1 w-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="h-1 w-1 bg-blue-400 rounded-full animate-bounce"></span>
        </div>
      );
    };

    return (
      <div className="flex items-end justify-start animate-in fade-in-50 duration-300 py-2">
        <div className="h-8 w-8 md:h-9 md:w-9 mx-2 flex-shrink-0 flex items-center justify-center">
          {agentAvatar ? (
            <div
              dangerouslySetInnerHTML={{ __html: agentAvatar }}
              style={{ width: 36, height: 36 }}
            />
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: createAvatar(adventurer, {
                  seed: agentName || "Agent",
                }).toString(),
              }}
              style={{ width: 36, height: 36 }}
            />
          )}
        </div>
        <div className="max-w-[75%] p-3 rounded-xl shadow-sm bg-slate-800/40 border border-slate-700/50">
          {getIndicatorContent()}
        </div>
      </div>
    );
  }
);

AgentTypingIndicator.displayName = "AgentTypingIndicator";
