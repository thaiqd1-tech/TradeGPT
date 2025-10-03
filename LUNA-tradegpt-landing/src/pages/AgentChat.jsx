import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelectedWorkspace } from '../hooks/useSelectedWorkspace';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  getAgentById,
  checkThreadExists,
  createThread,
  getThreadMessages,
  getThreadByAgentId,
  deleteThread,
  getTaskRunsByThreadId,
} from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { Paperclip, ListPlus, Book, History, Lightbulb, Trash2, Bell, Coins, Gift } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { AgentTypingIndicator } from '../components/ui/agent-typing-indicator.jsx';
import LogAgentThinking from '../components/LogAgentThinking.jsx';
import ThinkingProcess from '../components/ThinkingProcess.jsx';
import { websocketService } from '../services/websocket';
import { WS_URL } from '../config/api';
import { fakeStreamMessage } from '../utils/fakeStreaming';
import { toast } from '../components/ui/use-toast';
import { ChatMessageContent } from '../components/chat/ChatMessageContent';
import { TaskHistory } from '../components/chat/TaskHistory';
import TradingViewWidget from '../components/TradingViewWidget';
import { LanguageToggle } from '../components/LanguageToggle';
import { CreditPurchaseDialog } from '../components/CreditPurchaseDialog';
import RedeemGiftcodeDialog from '../components/RedeemGiftcodeDialog';
import { Avatar } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../components/ui/dialog';

const AgentChat = () => {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspace } = useSelectedWorkspace();
  const { user } = useAuth();

  const [agent, setAgent] = React.useState(null);
  const [threadId, setThreadId] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [threads, setThreads] = React.useState([]);
  const [loadingThreads, setLoadingThreads] = React.useState(false);
  const chatRef = React.useRef(null);
  const [isThinking, setIsThinking] = React.useState(false);
  const [realtimeLogs, setRealtimeLogs] = React.useState({});
  const previousAgentIdRef = React.useRef(null);
  const isInitializingRef = React.useRef(false);
  const initializedAgentsRef = React.useRef(new Set());
  
  // Dialog states
  const [showCreditPurchase, setShowCreditPurchase] = React.useState(false);
  const [showGiftcodeModal, setShowGiftcodeModal] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  // TaskHistory and AgentMessageWithLog states
  const [taskRuns, setTaskRuns] = React.useState([]);
  const [messageLogs, setMessageLogs] = React.useState({});
  const [loadingLog, setLoadingLog] = React.useState({});
  const [logsByMessage, setLogsByMessage] = React.useState({});

  // Debug realtimeLogs changes
  React.useEffect(() => {
    console.log('🔍 realtimeLogs updated:', realtimeLogs);
  }, [realtimeLogs]);

  const workspaceId = workspace?.id || localStorage.getItem('selectedWorkspace');

  // AgentMessageWithLog component
  const AgentMessageWithLog = ({
    msg,
    userMsgId,
    messageLogs,
    loadingLog,
    handleShowLog,
    children,
  }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
    React.useEffect(() => {
      if (inView && userMsgId && !messageLogs[msg.id] && !loadingLog[msg.id]) {
        handleShowLog(msg.id, userMsgId);
      }
    }, [inView, userMsgId, msg.id, messageLogs, loadingLog]);
    return (
      <div ref={ref} key={msg.id} className="flex flex-col">
        {children}
      </div>
    );
  };

  // ChatInput: localizes typing state to avoid re-rendering the whole page on each keystroke
  const ChatInput = React.memo(function ChatInput({ onSend, sending, threadId }) {
    const [localInput, setLocalInput] = React.useState('');
    const onSubmit = React.useCallback(() => {
      const content = (localInput || '').trim();
      if (!content) return;
      setLocalInput('');
      onSend(content);
    }, [localInput, onSend]);
    return (
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Textarea
            placeholder={threadId ? "Trò chuyện với nhân viên của bạn" : "Bắt đầu trò chuyện hoặc nhấn 'New chat' để tạo cuộc hội thoại mới"}
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
            rows={1}
            className="pr-12 bg-background text-foreground placeholder:text-muted-foreground border border-border"
            disabled={sending}
          />
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-primary text-primary-foreground hover:opacity-90"
            onClick={onSubmit}
            disabled={sending || !localInput.trim()}
          >
            ➤
          </Button>
        </div>
      </div>
    );
  });

  // Helper function for handling log display
  const handleShowLog = React.useCallback(async (messageId, userMessageId) => {
    if (loadingLog[messageId]) return;
    
    setLoadingLog(prev => ({ ...prev, [messageId]: true }));
    try {
      // Load task runs for this message/thread
      const runs = await getTaskRunsByThreadId(user?.id, agentId);
      setMessageLogs(prev => ({ ...prev, [messageId]: runs?.data || [] }));
      setTaskRuns(runs?.data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoadingLog(prev => ({ ...prev, [messageId]: false }));
    }
  }, [user?.id, agentId, loadingLog]);

  // Helper function for retrying tasks
  const handleRetryTask = React.useCallback(async (taskRun) => {
    try {
      // Implement retry logic here
      console.log('Retrying task:', taskRun);
      toast({ title: 'Đang thử lại task...' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể thử lại task' });
    }
  }, []);

  // Helper function to get/set thread ID from localStorage
  const getStoredThreadId = React.useCallback((agentId, workspaceId) => {
    const key = `thread_${workspaceId}_${agentId}`;
    return localStorage.getItem(key);
  }, []);

  const setStoredThreadId = React.useCallback((agentId, workspaceId, threadId) => {
    const key = `thread_${workspaceId}_${agentId}`;
    if (threadId) {
      localStorage.setItem(key, threadId);
    } else {
      localStorage.removeItem(key);
    }
  }, []);

  const loadOrCreateThread = React.useCallback(async (forceNew = false) => {
    if (!workspaceId || !agentId) return;
    try {
      setError('');
      console.log('[DBG] loadOrCreateThread called', { forceNew, agentId, workspaceId });
      
      // Check stored thread ID first (unless forcing new)
      if (!forceNew) {
        const storedThreadId = getStoredThreadId(agentId, workspaceId);
        if (storedThreadId) {
          console.log('[DBG] Using stored thread_id', storedThreadId);
          // Verify thread still exists on server
          try {
            const messages = await getThreadMessages(storedThreadId);
            if (messages?.data !== undefined) {
              return storedThreadId;
            }
          } catch (e) {
            console.log('[DBG] Stored thread not found on server, removing from storage');
            setStoredThreadId(agentId, workspaceId, null);
          }
        }

        // Check for existing threads on server
        console.log('[DBG] checkThreadExists -> request', { agentId, workspaceId });
        const exists = await checkThreadExists(agentId, workspaceId);
        console.log('[DBG] checkThreadExists -> response', exists);
        if (exists?.exists && exists.thread_id) {
          console.log('[DBG] Using existing thread_id from checkThreadExists', exists.thread_id);
          setStoredThreadId(agentId, workspaceId, exists.thread_id);
          return exists.thread_id;
        }
      }
      
      // Create new thread
      const title = agent?.name ? `${agent.name}` : 'New chat';
      console.log('[DBG] createThread -> request', { workspace_id: workspaceId, agent_id: agentId, title });
      const created = await createThread({
        workspace_id: workspaceId,
        agent_id: agentId,
        title,
      });
      const newId = created?.data?.id || created?.data?.thread_id || created?.id;
      console.log('[DBG] createThread -> response', created, 'resolvedThreadId:', newId);
      
      // Store the new thread ID
      if (newId) {
        setStoredThreadId(agentId, workspaceId, newId);
      }
      
      return newId;
    } catch (e) {
      console.error('[DBG] loadOrCreateThread error', e);
      setError(e?.message || 'Không thể khởi tạo hội thoại');
      return null;
    }
  }, [workspaceId, agentId, agent?.name, getStoredThreadId, setStoredThreadId]);

  const loadMessages = React.useCallback(async (tid) => {
    if (!tid) return;
    try {
      const res = await getThreadMessages(tid);
      const list = (Array.isArray(res?.data) ? res.data : []).map((m) => ({
        id: m.id,
        role: m.sender_type === 'user' ? 'user' : 'assistant',
        content: m.message_content,
        timestamp: m.created_at,
        image_urls: m.image_urls,
        file_urls: m.file_urls,
        parent_message_id: m.parent_message_id,
        artifact: m.artifact,
      }));
      
      // Clear previous messages first to avoid duplicates
      setMessages([]);
      
      if (list.length === 0 && agent?.greeting_message) {
        setMessages([
          { id: 'greeting', role: 'assistant', content: agent.greeting_message, timestamp: new Date().toISOString() },
        ]);
      } else {
        setMessages(list);
      }
    } catch (e) {
      setError(e?.message || 'Không thể tải tin nhắn');
    }
  }, [agent?.greeting_message]);

  // Wait until WebSocket connection is open before sending any message
  const waitForWebSocketOpen = React.useCallback(async (timeoutMs = 5000) => {
    if (websocketService.getConnectionState() === 'open') return;
    await new Promise((resolve, reject) => {
      let settled = false;
      const onStateChange = (state) => {
        if (state === 'open' && !settled) {
          settled = true;
          websocketService.unsubscribeFromStateChange(onStateChange);
          resolve();
        }
        if (state === 'error' && !settled) {
          settled = true;
          websocketService.unsubscribeFromStateChange(onStateChange);
          reject(new Error('WebSocket error'));
        }
      };
      websocketService.subscribeToStateChange(onStateChange);
      setTimeout(() => {
        if (!settled) {
          settled = true;
          websocketService.unsubscribeFromStateChange(onStateChange);
          reject(new Error('WebSocket open timeout'));
        }
      }, timeoutMs);
    });
  }, []);

  const sendMessage = async (content) => {
    if (!content || !content.trim()) return;
    const trimmed = content.trim();
    setSending(true);
    const optimisticId = `optimistic-${Date.now()}`;
    
    // Use current thread ID, create one if needed
    let currentThreadId = threadId;
    if (!currentThreadId) {
      console.log('[DBG] No thread ID available, creating new thread automatically');
      try {
        currentThreadId = await loadOrCreateThread(true);
        if (!currentThreadId) {
          setError('Không thể tạo cuộc hội thoại mới');
          setSending(false);
          return;
        }
        setThreadId(currentThreadId);
      } catch (error) {
        console.error('[DBG] Error creating thread:', error);
        setError('Không thể tạo cuộc hội thoại mới: ' + (error?.message || 'Unknown error'));
        setSending(false);
        return;
      }
    }
    
    setMessages((prev) => {
      const optimisticMsg = { id: optimisticId, role: 'user', content: trimmed, timestamp: new Date().toISOString() };
      // Keep greeting message until we get real response from agent
      return [...prev, optimisticMsg];
    });
    
    try {
      setRealtimeLogs({});
      setIsThinking(true);
      
      // If WS not open, try to connect
      if (websocketService.getConnectionState() !== 'open') {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (token) {
          const url = `${WS_URL}?token=${token}&thread_id=${currentThreadId}`;
          websocketService.connect(url);
          websocketService.joinThread(currentThreadId);
          
          // Đợi WebSocket sẵn sàng trước khi gửi tin nhắn
          await waitForWebSocketOpen();
        }
      }
      
      console.log('[SEND->WS] Sending message', {
        thread_id: currentThreadId,
        optimisticId,
        content_length: (content || '').length,
        ws_state: websocketService.getConnectionState(),
      });
      
      websocketService.send({
        type: 'chat',
        thread_id: currentThreadId,
        content: trimmed,
        sender_type: 'user',
        sender_user_id: user?.id,
        message_id: optimisticId,
      });
      
      console.log('[SEND->WS] Message sent, waiting for response...');
      
      // Refresh threads list if this was the first message or new thread was created
      setTimeout(() => {
        console.log('[DBG] Refreshing threads list after sending message');
        fetchThreads();
      }, 2000);
      // Verify delivery after a short delay
      setTimeout(async () => {
        try {
          const res = await getThreadMessages(currentThreadId);
          const serverMsgs = (Array.isArray(res?.data) ? res.data : []).map((m) => ({
            id: m.id,
            role: m.sender_type === 'user' ? 'user' : 'assistant',
            content: m.message_content,
            timestamp: m.created_at,
          }));
          const lastUser = [...serverMsgs].reverse().find((m) => m.role === 'user');
          const receivedUser = lastUser && lastUser.content?.trim() === trimmed;
          const reply = [...serverMsgs].reverse().find((m) => m.role === 'assistant');
          if (receivedUser) {
            toast({ title: 'Đã nhận prompt', description: 'Server đã lưu tin nhắn của bạn.' });
          } else {
            toast({ variant: 'destructive', title: 'Chưa thấy prompt', description: 'Server chưa lưu tin nhắn vừa gửi.' });
          }
          if (reply) {
            // If we already loaded messages, UI will show; this is just confirmation
            console.log('[Verify] Assistant reply preview:', reply.content?.slice(0, 120));
          }
        } catch (err) {
          console.warn('Verify delivery error', err);
        }
      }, 1200);
    } catch (e) {
      setError(e?.message || 'Gửi tin nhắn thất bại');
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = async () => {
    try {
      // Clear stored thread ID to force creation of new thread
      setStoredThreadId(agentId, workspaceId, null);
      
      // Create new thread immediately
      const title = agent?.name ? `${agent.name}` : 'New chat';
      console.log('[DBG] Creating new thread for New Chat action', { workspace_id: workspaceId, agent_id: agentId, title });
      
      const created = await createThread({
        workspace_id: workspaceId,
        agent_id: agentId,
        title,
      });
      
      const newThreadId = created?.data?.id || created?.data?.thread_id || created?.id;
      console.log('[DBG] New thread created', { newThreadId, response: created });
      
      if (newThreadId) {
        // Store the new thread ID
        setStoredThreadId(agentId, workspaceId, newThreadId);
        
        // Reset all chat-related states to avoid duplicates
        setMessages([]);
        setMessageLogs({});
        setLoadingLog({});
        setTaskRuns([]);
        setError('');
        
        // Set new thread and load messages
        setThreadId(newThreadId);
        // Don't load messages for new thread - keep greeting message
        // await loadMessages(newThreadId);
        
        // Refresh threads list to show the new thread in sidebar
        await fetchThreads();
        
        if (searchParams.get('newChat') === '1') {
          searchParams.delete('newChat');
          setSearchParams(searchParams, { replace: true });
        }
      }
    } catch (error) {
      console.error('[DBG] Error creating new chat:', error);
      setError('Không thể tạo cuộc hội thoại mới: ' + (error?.message || 'Unknown error'));
    }
  };

  const fetchThreads = React.useCallback(async () => {
    if (!agentId) return [];
    setLoadingThreads(true);
    try {
      console.log('[DBG] getThreadByAgentId -> request', { agentId });
      const res = await getThreadByAgentId(agentId);
      console.log('[DBG] getThreadByAgentId -> response', res);
      const arr = Array.isArray(res?.data) ? res.data : [];
      console.log('[DBG] Found threads:', arr.length, arr.map(t => ({ id: t.id, title: t.title, created_at: t.created_at })));
      // Sắp xếp thread theo updated_at/created_at mới nhất
      const sorted = [...arr].sort((a, b) => {
        const ta = new Date(a?.updated_at || a?.created_at || 0).getTime();
        const tb = new Date(b?.updated_at || b?.created_at || 0).getTime();
        return tb - ta;
      });
      setThreads(sorted);
      return sorted;
    } catch (err) {
      console.error('[DBG] getThreadByAgentId error', err);
      setThreads([]);
      return [];
    } finally {
      setLoadingThreads(false);
    }
  }, [agentId]);

  const handleDeleteThread = async (threadIdToDelete) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await deleteThread(threadIdToDelete);

      // Nếu đang xóa thread hiện tại, chuyển về trạng thái ban đầu
      if (threadId === threadIdToDelete) {
        setStoredThreadId(agentId, workspaceId, null);
        setThreadId(null);
        setMessages([]);
      }

      // Cập nhật danh sách threads
      setThreads(prev => prev.filter(t => t.id !== threadIdToDelete));

      toast({
        title: 'Successed',
        description: 'Conversation deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Cannot delete conversation',
      });
    }
  };

  React.useEffect(() => {
    // Cần cả agentId và workspaceId
    if (!agentId || !workspaceId) {
      return;
    }

    // Ngăn chặn chạy đồng thời và duplicate initialization
    if (isInitializingRef.current) {
      console.log('[DBG] Already initializing, skipping...');
      return;
    }

    // Skip if same agent and already have threadId (but not for new agents)
    if (agentId === previousAgentIdRef.current && threadId) {
      console.log('[DBG] Same agent with existing threadId, skipping init');
      return;
    }

    // Skip if we've already initialized this agent
    const agentKey = `${agentId}-${workspaceId}`;
    if (initializedAgentsRef.current.has(agentKey)) {
      console.log('[DBG] Agent already initialized, skipping...', agentKey);
      return;
    }

    isInitializingRef.current = true;
    previousAgentIdRef.current = agentId;

    let mounted = true;
    const init = async () => {
      try {
        console.log('[DBG] init AgentChat', { agentId, workspaceId });
        
        // Mark this agent as initialized
        initializedAgentsRef.current.add(agentKey);
        
        // Reset all states when switching agents to avoid duplicates
        setMessages([]);
        setMessageLogs({});
        setLoadingLog({});
        setTaskRuns([]);
        setError('');
        
        // Clear any stored thread ID for this agent to force fresh connection
        setStoredThreadId(agentId, workspaceId, null);
        
        const a = await getAgentById(agentId);
        const agentData = a?.data || a;
        if (mounted) setAgent(agentData || null);

        // Load threads list immediately to show in sidebar
        const threadsList = await fetchThreads();
        if (!mounted) return;

        const forceNew = searchParams.get('newChat') === '1';
        console.log('[DBG] URL param newChat', { newChat: searchParams.get('newChat'), forceNew });
        
        let tid = null;
        
        if (forceNew) {
          // Force create new thread
          tid = await loadOrCreateThread(true);
        } else {
          // Try to load stored thread first
          const storedThreadId = getStoredThreadId(agentId, workspaceId);
          if (storedThreadId) {
            console.log('[DBG] Using stored thread_id', storedThreadId);
            // Verify thread still exists on server
            try {
              const messages = await getThreadMessages(storedThreadId);
              if (messages?.data !== undefined) {
                tid = storedThreadId;
              } else {
                console.log('[DBG] Stored thread not found on server, removing from storage');
                setStoredThreadId(agentId, workspaceId, null);
              }
            } catch (e) {
              console.log('[DBG] Error verifying stored thread, removing from storage');
              setStoredThreadId(agentId, workspaceId, null);
            }
          }
          
          // If no stored thread, try to use latest from threads list
          if (!tid && threadsList && threadsList.length > 0) {
            const latest = threadsList[0];
            console.log('[DBG] Using latest thread from fetched list', latest?.id);
            tid = latest.id;
            setStoredThreadId(agentId, workspaceId, latest.id);
          }
          
          // If still no thread, don't create one - user must click "New chat"
          if (!tid) {
            console.log('[DBG] No existing threads, user must click "New chat" to create one');
            tid = null;
          }
        }
        
        if (!mounted) return;
        console.log('[DBG] resolved threadId to load', tid);
        if (tid) {
          setThreadId(tid);
          await loadMessages(tid);
        } else {
          // No thread yet - show greeting message and prompt user to start new chat
          setThreadId(null);
          if (agentData?.greeting_message) {
            setMessages([
              { id: 'greeting', role: 'assistant', content: agentData.greeting_message, timestamp: new Date().toISOString() },
            ]);
          }
        }
        
        if (forceNew) {
          searchParams.delete('newChat');
          setSearchParams(searchParams, { replace: true });
        }
      } finally {
        if (mounted) setLoading(false);
        isInitializingRef.current = false;
      }
    };
    init();
    return () => {
      mounted = false;
      // Reset refs khi unmount để tránh stuck state
      isInitializingRef.current = false;
      previousAgentIdRef.current = null;
      // Clear initialized agents when component unmounts
      initializedAgentsRef.current.clear();
    };
  }, [agentId, workspaceId]);

  // charts render from per-message artifact; no global artifact load

  React.useEffect(() => {
    // Only connect WebSocket if we have a threadId
    if (!threadId) {
      console.log('[DBG] No threadId, skipping WebSocket connection');
      // Disconnect any existing WebSocket to avoid stale connections
      websocketService.disconnect();
      return;
    }
    
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) return;
    
    console.log('[DBG] WebSocket connecting to thread:', threadId);
    const url = `${WS_URL}?token=${token}&thread_id=${threadId}`;
    websocketService.connect(url);
    websocketService.joinThread(threadId);

    const onMessage = (payload) => {
      try {
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
        console.log('🔔 Received WebSocket message:', data);
        console.log('🔍 Message type:', data.type, 'Thread ID:', data.thread_id || 'N/A');

        // Debug: Kiểm tra tất cả message types
        if (data.type) {
          console.log('🔍 Message type:', data.type);
        }
        const msg = data.chat_message ? data.chat_message : data;
        const optimisticId = data.optimistic_id || msg.optimistic_id;

        if (optimisticId) {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === optimisticId);
            const confirmed = {
              id: msg.id,
              role: msg.sender_type === 'user' ? 'user' : 'assistant',
              content: msg.message_content || msg.content,
              timestamp: msg.created_at,
              image_urls: msg.image_urls,
              file_urls: msg.file_urls,
              parent_message_id: msg.parent_message_id,
              artifact: msg.artifact,
            };
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = confirmed;
              return copy;
            }
            if (!prev.some((m) => m.id === confirmed.id)) {
              // Keep greeting message until we get real agent response
              return [...prev, confirmed];
            }
            return prev;
          });
          if (msg.sender_type === 'agent') {
            setIsThinking(false);
            // Refresh threads list when agent responds
            setTimeout(() => {
              console.log('[DBG] Refreshing threads list after agent response');
              fetchThreads();
            }, 1000);
          }
          return;
        }

        if (data.type === 'chat') {
          if (msg.sender_type === 'agent') {
            // Chỉ nhận reply có id theo đúng quy trình mẫu
            console.log('🤖 Agent message received, msg.id:', msg.id, 'msg:', msg);
            if (!msg.id) {
              console.log('❌ Bỏ qua agent message không có id');
              return;
            }
            setIsThinking(false);
            const newId = msg.id;

            // Kiểm tra xem message đã tồn tại chưa để tránh duplicate
            setMessages((prev) => {
              if (prev.some(m => m.id === newId)) return prev;
              // Keep greeting message and add agent response below it
              return [...prev, { id: newId, role: 'assistant', content: '', timestamp: msg.created_at, isStreaming: true, artifact: msg.artifact }];
            });

            const full = msg.message_content || msg.content || '';
            const lines = full.split('\n');
            const preview = lines.slice(0, 4).join('\n');

            fakeStreamMessage(preview, (partial) => {
              setMessages((prev) => {
                const i = prev.findIndex((m) => m.id === newId);
                if (i === -1) return prev;
                const copy = [...prev];
                copy[i] = { ...copy[i], content: partial };
                return copy;
              });
            }, () => {
              setMessages((prev) => {
                const i = prev.findIndex((m) => m.id === newId);
                if (i === -1) return prev;
                const copy = [...prev];
                copy[i] = { ...copy[i], content: full, isStreaming: false };
                return copy;
              });
            }, 5, 'chunk');
          } else {
            setMessages((prev) => {
              const newUserMsg = { id: msg.id || `ws-${Date.now()}`, role: 'user', content: msg.message_content || msg.content, timestamp: msg.created_at };
              // Keep greeting message until we get real agent response
              return [...prev, newUserMsg];
            });
          }
          return;
        }

        if (data.type === 'done') {
          setIsThinking(false);
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last.role === 'assistant' && last.isStreaming) copy[copy.length - 1] = { ...last, isStreaming: false };
            return copy;
          });
          // Refresh threads list when conversation is done
          setTimeout(() => {
            console.log('[DBG] Refreshing threads list after conversation done');
            fetchThreads();
          }, 500);
          return;
        }

        if (data.type === 'status') {
          try {
            // content có thể là chuỗi JSON hoặc chuỗi trạng thái ngắn
            const content = data.content;
            if (typeof content === 'string' && content.trim().startsWith('{')) {
              const parsed = JSON.parse(content);
              // Nếu status = processing, bật typing
              if (parsed.status === 'processing') setIsThinking(true);
            } else {
              // Khi backend chỉ gửi "processing"
              if (String(content).toLowerCase().includes('processing')) setIsThinking(true);
            }
          } catch {
            // ignore parse errors
          }
          return;
        }

        if (data.type === 'credit_update' && typeof data.credit === 'number') {
          // update UI credit if needed
          return;
        }

        // Xử lý subflow_log từ backend
        if (data.type === 'subflow_log' || data.type === 'subflow_result') {
          console.log('🔍 Received subflow log:', data);
          const log = {
            ...data,
            is_result: data.type === 'subflow_result',
          };
          const msgId = log.message_id || log.thread_id || 'default';
          const logType = data.log_type || (data.type === 'subflow_result' ? 'result' : 'execute');

          console.log('🔍 Processing log - msgId:', msgId, 'logType:', logType);

          // Lưu log theo dạng danh sách để không bị ghi đè
          setRealtimeLogs((prev) => {
            const list = Array.isArray(prev[msgId]) ? prev[msgId] : [];
            const newLogs = { ...prev, [msgId]: [...list, log] };
            console.log('🔍 Updated realtimeLogs (array):', newLogs);
            return newLogs;
          });
          setLogsByMessage((prev) => {
            const list = Array.isArray(prev[msgId]) ? prev[msgId] : [];
            return { ...prev, [msgId]: [...list, log] };
          });
          return;
        }
      } catch (e) {
        console.warn('WS parse error', e);
      }
    };

    websocketService.subscribe('chat', onMessage);
    websocketService.subscribe('done', onMessage);
    websocketService.subscribe('credit_update', onMessage);
    websocketService.subscribe('status', onMessage);
    // Subscribe to thinking logs from backend
    websocketService.subscribe('subflow_log', onMessage);
    websocketService.subscribe('subflow_result', onMessage);

    return () => {
      console.log('[DBG] WebSocket cleanup for thread:', threadId);
      websocketService.unsubscribe('chat', onMessage);
      websocketService.unsubscribe('done', onMessage);
      websocketService.unsubscribe('credit_update', onMessage);
      websocketService.unsubscribe('status', onMessage);
      websocketService.unsubscribe('subflow_log', onMessage);
      websocketService.unsubscribe('subflow_result', onMessage);
      // Don't disconnect here as it might be used by other components
    };
  }, [threadId]);

  if (!workspaceId) {
    return (
      <div className="p-4 text-yellow-500">Chưa có workspace. Vui lòng tạo/chọn workspace trước.</div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" userRole={user?.role || 'member'} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="text-sm text-muted-foreground" onClick={() => navigate('/dashboard')}>← Dashboard</button>
            <h1 className="text-lg font-semibold text-slate-100">{agent?.name || 'Agent'}</h1>
          </div>
          
          {/* Right section with action buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notification Bell */}
            <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative !bg-transparent !text-foreground hover:!bg-transparent focus-visible:!ring-0"
                  aria-label="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] md:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Thông báo</DialogTitle>
                  <DialogDescription>
                    Các thông báo và cập nhật mới nhất
                  </DialogDescription>
                </DialogHeader>
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có thông báo nào
                </div>
              </DialogContent>
            </Dialog>

            {/* Credit Display and Purchase */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="!bg-transparent !text-foreground hover:!bg-transparent focus-visible:!ring-0" 
                onClick={() => setShowCreditPurchase(true)}
              >
                <Coins className="h-5 w-5 text-yellow-400" />
              </Button>
              <span className="font-semibold text-yellow-400 text-sm min-w-[48px] text-center select-none">
                {user?.credit ?? 0}
              </span>
            </div>

            {/* Gift Box */}
            <Button 
              variant="outline" 
              size="icon" 
              className="!bg-transparent !text-foreground hover:!bg-transparent focus-visible:!ring-0" 
              onClick={() => setShowGiftcodeModal(true)}
            >
              <Gift className="h-5 w-5" />
            </Button>

            {/* Language Toggle */}
            <LanguageToggle />

            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('access_token');
                  navigate('/login');
                }}>
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-80 border-r border-border p-4 flex-shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-base font-semibold text-slate-100">{agent?.name || 'Agent'}</div>
                <div className="text-xs text-slate-400">{agent?.position || agent?.role_description || 'AI Assistant'}</div>
              </div>
              <Button size="sm" onClick={handleNewChat}>New chat</Button>
            </div>
            {!loadingThreads && (!threads || threads.length === 0) && (
              <div className="text-xs text-muted-foreground mb-2">Không có cuộc hội thoại nào</div>
            )}
            {loadingThreads ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, idx) => (<Skeleton key={idx} className="h-10 w-full" />))}
              </div>
            ) : (
              <div className="space-y-2">
                {(threads || []).map((t) => (
                  <div
                    key={t.id}
                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 flex items-center justify-between group ${threadId === t.id ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' : 'border-slate-600 text-slate-300 hover:bg-slate-800/60 hover:border-slate-500'}`}
                  >
                    <button
                      onClick={async () => { 
                        setThreadId(t.id); 
                        setStoredThreadId(agentId, workspaceId, t.id);
                        await loadMessages(t.id); 
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="text-sm font-medium truncate">{t.title || 'New chat'}</div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(t.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300"
                      title="Xóa cuộc hội thoại"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
          <main className="flex-1 overflow-hidden flex flex-col">
            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 space-y-3">
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {loading ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
              ) : (
                messages.map((m) => {
                  const userMsg = messages.find(msg => msg.id < m.id && msg.role === 'user');
                  return (
                    <AgentMessageWithLog
                      key={m.id}
                      msg={m}
                      userMsgId={userMsg?.id}
                      messageLogs={messageLogs}
                      loadingLog={loadingLog}
                      handleShowLog={handleShowLog}
                    >
                      <div className={m.role === 'user' ? 'text-right' : 'text-left'}>
                        <div className={`inline-block px-4 py-2.5 rounded-xl max-w-[75%] ${m.role === 'user' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800/60 text-slate-100 border border-slate-700/50'}`}>
                          {m.role === 'assistant' ? (
                            <ChatMessageContent
                              content={(m.content || '').replace(/^\s*•\s+/gm, '- ')}
                              isAgent={true}
                              stream={m.isStreaming ?? false}
                              images={m.image_urls}
                            />
                          ) : (
                            m.content
                          )}
                          {m.role === 'assistant' && m.artifact && m.artifact.type === 'chart' && m.artifact.exchange_symbol && (
                            <div className="mt-3">
                              <div className="block w-full">
                                <TradingViewWidget
                                  artifact={m.artifact}
                                  symbol={m.artifact.exchange_symbol}
                                  theme="dark"
                                  locale="vi"
                                  height={1000}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`text-xs text-slate-400 mt-1.5 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {m.timestamp ? new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                        </div>
                        {/* Persistent realtime logs for this assistant message */}
                        {m.role === 'assistant' && Array.isArray(logsByMessage[m.id]) && logsByMessage[m.id].length > 0 && (
                          <div className="mt-3 max-w-[75%]">
                            <LogAgentThinking logs={logsByMessage[m.id]} isCollapsed={false} />
                          </div>
                        )}
                        {/* TaskHistory for assistant messages */}
                        {m.role === 'assistant' && messageLogs[m.id] && messageLogs[m.id].length > 0 && (
                          <div className="mt-4 max-w-[75%]">
                            <TaskHistory 
                              runs={messageLogs[m.id]} 
                              agentId={agentId} 
                              onRetry={handleRetryTask}
                            />
                          </div>
                        )}
                      </div>
                    </AgentMessageWithLog>
                  );
                })
              )}
              {isThinking && (
                <div className="text-left">
                  <div className="inline-block px-4 py-3 rounded-xl bg-slate-800/40 border border-blue-500/30">
                    <AgentTypingIndicator
                      subflowLogs={Object.values(realtimeLogs).flat().filter(log => log && typeof log === 'object')}
                    />
                  </div>
                  {/* Hiển thị ThinkingProcess với realtimeLogs */}
                  {Object.keys(realtimeLogs).length > 0 && (
                    <div className="mt-3">
                      <ThinkingProcess 
                        isDark={true} 
                        realtimeLogs={realtimeLogs}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="border-t border-border p-4">
              <ChatInput onSend={sendMessage} sending={sending} threadId={threadId} />
            </div>
          </main>
        </div>
      </div>
      
      {/* Dialog Components */}
      <CreditPurchaseDialog 
        open={showCreditPurchase} 
        onOpenChange={setShowCreditPurchase} 
      />
      <RedeemGiftcodeDialog 
        open={showGiftcodeModal} 
        onOpenChange={setShowGiftcodeModal} 
      />
    </div>
  );
};

export default AgentChat;


