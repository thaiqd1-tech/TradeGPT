import React from 'react';

export interface LogMessageProps {
  log: any;
}

// Render a single log line (used by AgentTypingIndicator)
export const LogMessage: React.FC<LogMessageProps> = ({ log }) => {
  const time = (() => {
    try {
      const ts = log?.timestamp || log?.created_at || '';
      return ts
        ? new Date(ts).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
        : '';
    } catch {
      return '';
    }
  })();

  const content: string = typeof log?.content === 'string' ? log.content : JSON.stringify(log?.content ?? '');
  const isResult = Boolean(log?.is_result) || String(log?.log_type || '').toLowerCase() === 'result';

  return (
    <div className="flex items-start gap-2">
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isResult ? 'bg-green-900/40 text-green-300' : 'bg-blue-900/40 text-blue-300'}`}>
        {isResult ? 'RESULT' : 'EXEC'}
      </span>
      <span className="text-[10px] text-muted-foreground select-none mt-0.5">{time}</span>
      <span className="text-xs text-foreground break-words">{content}</span>
    </div>
  );
};

export interface LogAgentThinkingProps {
  logs: any[];
  isCollapsed?: boolean;
}

// Optional viewer of logs list (not required by AgentTypingIndicator, but useful elsewhere)
const LogAgentThinking: React.FC<LogAgentThinkingProps> = ({ logs = [], isCollapsed }) => {
  const items = Array.isArray(logs) ? logs : [];
  const visible = isCollapsed ? items.slice(-2) : items;
  return (
    <div className="space-y-1">
      {visible.map((log, idx) => (
        <LogMessage key={(log?.timestamp as string) ?? idx} log={log} />
      ))}
    </div>
  );
};

export default LogAgentThinking;


