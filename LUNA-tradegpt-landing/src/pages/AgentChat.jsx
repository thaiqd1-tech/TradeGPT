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
} from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { Paperclip, ListPlus, Book, History, Lightbulb, Trash2 } from 'lucide-react';
import { AgentTypingIndicator } from '../components/ui/agent-typing-indicator';
import { websocketService } from '../services/websocket';
import { WS_URL } from '../config/api';
import { fakeStreamMessage } from '../utils/fakeStreaming';
import { toast } from '../components/ui/use-toast';
import { ChatMessageContent } from '../components/chat/ChatMessageContent';
import TradingViewWidget from '../components/TradingViewWidget';

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

  // Debug realtimeLogs changes
  React.useEffect(() => {
    console.log('🔍 realtimeLogs updated:', realtimeLogs);
  }, [realtimeLogs]);

  const workspaceId = workspace?.id || localStorage.getItem('selectedWorkspace');

  const loadOrCreateThread = React.useCallback(async (forceNew = false) => {
    if (!workspaceId || !agentId) return;
    try {
      setError('');
      console.log('[DBG] loadOrCreateThread called', { forceNew, agentId, workspaceId });
      if (!forceNew) {
        console.log('[DBG] checkThreadExists -> request', { agentId, workspaceId });
        const exists = await checkThreadExists(agentId, workspaceId);
        console.log('[DBG] checkThreadExists -> response', exists);
        if (exists?.exists && exists.thread_id) {
          console.log('[DBG] Using existing thread_id from checkThreadExists', exists.thread_id);
          setThreadId(exists.thread_id);
          return exists.thread_id;
        }
      }
      // Idempotent check ngay trước khi tạo mới để chống double-init
      // Idempotent re-check ONLY when not forceNew, so the "New chat" button can truly create
      if (!forceNew) {
        console.log('[DBG] Re-check before createThread');
        const exists2 = await checkThreadExists(agentId, workspaceId);
        if (exists2?.exists && exists2.thread_id) {
          console.log('[DBG] Found existing thread on re-check. Skip create. thread_id=', exists2.thread_id);
          setThreadId(exists2.thread_id);
          return exists2.thread_id;
        }
      }
      const title = agent?.name ? `${agent.name}` : 'New chat';
      console.log('[DBG] createThread -> request', { workspace_id: workspaceId, agent_id: agentId, title });
      const created = await createThread({
        workspace_id: workspaceId,
        agent_id: agentId,
        title,
      });
      const newId = created?.data?.id || created?.data?.thread_id || created?.id;
      console.log('[DBG] createThread -> response', created, 'resolvedThreadId:', newId);
      setThreadId(newId);
      return newId;
    } catch (e) {
      console.error('[DBG] loadOrCreateThread error', e);
      setError(e?.message || 'Không thể khởi tạo hội thoại');
      return null;
    }
  }, [workspaceId, agentId, agent?.name]);

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

  const handleSend = async () => {
    if (!input.trim() || !threadId) return;
    // If WS not open, try to connect and abort this send
    if (websocketService.getConnectionState() !== 'open') {
      setError('Kết nối đang thiết lập. Vui lòng thử lại sau giây lát.');
      return;
    }
    const content = input.trim();
    setInput('');
    setSending(true);
    const optimisticId = `optimistic-${Date.now()}`;
    setMessages((prev) => [...prev, { id: optimisticId, role: 'user', content, timestamp: new Date().toISOString() }]);
    try {
      setRealtimeLogs({});
      setIsThinking(true);
      websocketService.send({
        type: 'chat',
        thread_id: threadId,
        content,
        sender_type: 'user',
        sender_user_id: user?.id,
        message_id: optimisticId,
      });
      // Verify delivery after a short delay
      setTimeout(async () => {
        try {
          const res = await getThreadMessages(threadId);
          const serverMsgs = (Array.isArray(res?.data) ? res.data : []).map((m) => ({
            id: m.id,
            role: m.sender_type === 'user' ? 'user' : 'assistant',
            content: m.message_content,
            timestamp: m.created_at,
          }));
          const lastUser = [...serverMsgs].reverse().find((m) => m.role === 'user');
          const receivedUser = lastUser && lastUser.content?.trim() === content.trim();
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
    const tid = await loadOrCreateThread(true);
    if (tid) {
      setMessages([]);
      await loadMessages(tid);
      if (searchParams.get('newChat') === '1') {
        searchParams.delete('newChat');
        setSearchParams(searchParams, { replace: true });
      }
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
    if (!agentId || !workspaceId || agentId === previousAgentIdRef.current) {
      return;
    }

    // Ngăn chặn chạy đồng thời
    if (isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    previousAgentIdRef.current = agentId;

    let mounted = true;
    const init = async () => {
      try {
        console.log('[DBG] init AgentChat', { agentId, workspaceId });
        const a = await getAgentById(agentId);
        const agentData = a?.data || a;
        if (mounted) setAgent(agentData || null);

        const forceNew = searchParams.get('newChat') === '1';
        console.log('[DBG] URL param newChat', { newChat: searchParams.get('newChat'), forceNew });
        const list = await fetchThreads();
        // Nếu không ép tạo mới và có danh sách thread, chọn thread gần nhất
        if (!forceNew && list && list.length > 0) {
          const latest = list[0];
          console.log('[DBG] Using latest thread from list', latest?.id);
          setThreadId(latest.id);
          if (!mounted) return;
          await loadMessages(latest.id);
          if (mounted) setLoading(false);
          return; // Không tạo mới
        }

        const tid = await loadOrCreateThread(forceNew);
        if (!mounted) return;
        console.log('[DBG] resolved threadId to load', tid);
        if (tid) await loadMessages(tid);
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
    };
  }, [agentId, workspaceId]);

  // charts render from per-message artifact; no global artifact load

  React.useEffect(() => {
    if (!threadId) return;
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) return;
    const url = `${WS_URL}?token=${token}&thread_id=${threadId}`;
    websocketService.connect(url);
    websocketService.joinThread(threadId);

    const onMessage = (payload) => {
      try {
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
        console.log('🔔 Received WebSocket message:', data);

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
            if (!prev.some((m) => m.id === confirmed.id)) return [...prev, confirmed];
            return prev;
          });
          if (msg.sender_type === 'agent') setIsThinking(false);
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
            // Reset realtimeLogs cho message agent này
            setRealtimeLogs((prev) => {
              const newLogs = { ...prev };
              if (msg.id) delete newLogs[msg.id];
              return newLogs;
            });
            const newId = msg.id;

            // Kiểm tra xem message đã tồn tại chưa để tránh duplicate
            setMessages((prev) => {
              if (prev.some(m => m.id === newId)) return prev;
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
            setMessages((prev) => [...prev, { id: msg.id || `ws-${Date.now()}`, role: 'user', content: msg.message_content || msg.content, timestamp: msg.created_at }]);
          }
          return;
        }

        if (data.type === 'done') {
          setIsThinking(false);
          // Reset realtimeLogs cho message agent cuối cùng
          setRealtimeLogs((prev) => {
            const newLogs = { ...prev };
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id) {
              delete newLogs[lastMsg.id];
            }
            return newLogs;
          });
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last.role === 'assistant' && last.isStreaming) copy[copy.length - 1] = { ...last, isStreaming: false };
            return copy;
          });
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

          setRealtimeLogs((prev) => {
            const newLogs = {
              ...prev,
              [msgId]: {
                ...prev[msgId],
                [logType]: log
              }
            };
            console.log('🔍 Updated realtimeLogs:', newLogs);
            return newLogs;
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

    return () => {
      websocketService.unsubscribe('chat', onMessage);
      websocketService.unsubscribe('done', onMessage);
      websocketService.unsubscribe('credit_update', onMessage);
      websocketService.unsubscribe('status', onMessage);
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
                      onClick={async () => { setThreadId(t.id); await loadMessages(t.id); }}
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
                messages.map((m) => (
                  <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
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
                  </div>
                ))
              )}
              {isThinking && (
                <div className="text-left">
                  <div className="inline-block px-4 py-3 rounded-xl bg-slate-800/40 border border-blue-500/30">
                    <AgentTypingIndicator
                      subflowLogs={Object.values(realtimeLogs).flatMap(logs =>
                        Object.values(logs).filter(log => log && typeof log === 'object')
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-border p-4">
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <Textarea
                    placeholder="Trò chuyện với nhân viên của bạn"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    rows={1}
                    className="pr-12 bg-background text-foreground placeholder:text-muted-foreground border border-border"
                    disabled={sending || !threadId}
                  />
                  <Button
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-primary text-primary-foreground hover:opacity-90"
                    onClick={handleSend}
                    disabled={sending || !input.trim() || !threadId}
                  >
                    ➤
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;


