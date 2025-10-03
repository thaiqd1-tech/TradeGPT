import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Zap, Search, Code, Clock, CheckCircle } from 'lucide-react';

const getIcon = (type, logType) => {
  // Ưu tiên logType từ websocket message
  if (logType === 'result') {
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  }
  if (logType === 'execute') {
    return <Clock className="w-4 h-4 text-blue-500" />;
  }
  
  // Fallback cho type cũ
  switch (type) {
    case 'action':
      return <Zap className="w-4 h-4 text-yellow-500" />;
    case 'search_result':
      return <Search className="w-4 h-4 text-green-500" />;
    case 'code':
      return <Code className="w-4 h-4 text-sky-500" />;
    default:
      return <Zap className="w-4 h-4 text-yellow-500" />;
  }
};

const ThinkingProcess = ({ isDark, steps, realtimeLogs = {} }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [processedSteps, setProcessedSteps] = useState([]);


  // Xử lý realtimeLogs từ websocket
  useEffect(() => {
    if (realtimeLogs && Object.keys(realtimeLogs).length > 0) {
      // Hỗ trợ cả 2 dạng: object-of-objects và object-of-arrays
      const allLogs = Object.values(realtimeLogs).flatMap((entry) => {
        if (Array.isArray(entry)) {
          return entry;
        }
        if (entry && typeof entry === 'object') {
          return Object.values(entry);
        }
        return [];
      }).filter((log) => log && typeof log === 'object');

      const formattedSteps = allLogs.map((log, index) => ({
        id: `${log.thread_id || 'default'}-${index}`,
        type: log.log_type === 'result' ? 'result' : 'execute',
        title: log.log_type === 'result' ? 'Kết quả' : 'Đang thực thi',
        content: log.content || '',
        timestamp: log.timestamp,
        logType: log.log_type
      }));

      setProcessedSteps(formattedSteps);
    } else if (steps && steps.length > 0) {
      // Fallback cho steps cũ
      setProcessedSteps(steps);
    }
  }, [realtimeLogs, steps]);

  return (
    <div className="mb-3">
      {processedSteps.length > 0 && (
        <div className="space-y-2">
        </div>
      )}
    </div>
  );
};

export default ThinkingProcess;