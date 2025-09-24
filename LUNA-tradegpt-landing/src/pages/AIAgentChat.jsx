import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { aiService } from '../services/ai.service';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { AgentTypingIndicator } from '../components/ui/agent-typing-indicator';
import { useSelectedWorkspace } from '../hooks/useSelectedWorkspace';
import { Skeleton } from '../components/ui/skeleton';

const AIAgentChat = () => {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const { user } = useAuth();
  const { workspace } = useSelectedWorkspace();

  const [sessionId, setSessionId] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isThinking, setIsThinking] = React.useState(false);
  const [sessions, setSessions] = React.useState([]);
  const [loadingSessions, setLoadingSessions] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        aiService.setCurrentUser(user?.id || '', user?.name || '');
        // Load AI agent detail (optional in current UI)
        // Load chat history sessions first
        setLoadingSessions(true);
        try {
          const history = await aiService.getChatHistory(agentId || '');
          const list = Array.isArray(history?.sessions) ? history.sessions : Array.isArray(history) ? history : [];
          if (mounted) setSessions(list);
        } catch {
          if (mounted) setSessions([]);
        } finally {
          if (mounted) setLoadingSessions(false);
        }

        // Create a fresh session
        const s = await aiService.createSession(user?.id, user?.name);
        if (!mounted) return;
        setSessionId(s?.session_id || null);
      } catch (e) {
        setError(e?.message || 'Không thể khởi tạo phiên AI');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, [agentId, user?.id, user?.name]);

  const convertEventsToMessages = (events) => {
    return (Array.isArray(events) ? events : [])
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((ev) => {
        let text = '';
        try {
          const content = JSON.parse(ev.content);
          text = content?.parts?.[0]?.text || '';
        } catch {
          text = ev?.content || '';
        }
        return {
          id: ev.id,
          content: text,
          role: ev.author === 'user' ? 'user' : 'assistant',
          timestamp: ev.timestamp,
        };
      });
  };

  const loadSessionMessages = async (sid) => {
    if (!sid) return;
    try {
      setLoading(true);
      const data = await aiService.getSessionEvents(sid);
      const msgs = convertEventsToMessages(data?.events || []);
      setMessages(
        msgs.map((m) => ({ id: m.id, content: m.content, role: m.role === 'user' ? 'user' : 'assistant', timestamp: m.timestamp }))
      );
      setSessionId(sid);
      aiService.setCurrentSession(sid);
    } catch (e) {
      setError(e?.message || 'Không thể tải phiên chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    setIsThinking(true);
    const optimistic = { id: `local-${Date.now()}`, role: 'user', content };
    setMessages((prev) => [...prev, optimistic]);
    let assistantText = '';
    try {
      await aiService.sendMessage(
        { message: content },
        (chunk) => {
          setIsThinking(false);
          assistantText += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && last.id.startsWith('stream-')) {
              const updated = [...prev];
              updated[updated.length - 1] = { ...last, content: assistantText };
              return updated;
            }
            return [...prev, { id: `stream-${Date.now()}`, role: 'assistant', content: assistantText }];
          });
        },
        () => {
          setIsThinking(false);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant' && last.id.startsWith('stream-')) {
              updated[updated.length - 1] = { ...last };
            }
            return updated;
          });
        },
        (err) => { setError(err?.message || 'Lỗi stream'); }
      );
    } catch (e) {
      setError(e?.message || 'Gửi tin nhắn thất bại');
    } finally {
      setSending(false);
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r hidden md:flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">AI Agent</div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>←</Button>
        </div>
        <div className="p-3 border-b">
          <Button className="w-full" onClick={async () => {
            try {
              setLoading(true);
              const s = await aiService.createSession(user?.id, user?.name);
              setSessionId(s?.session_id || null);
              setMessages([]);
            } finally {
              setLoading(false);
            }
          }}>New chat</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs text-muted-foreground mb-2">Chat sessions</div>
          {loadingSessions ? (
            <div className="space-y-2">
              {[1,2,3].map((i) => (<Skeleton key={i} className="h-10 w-full" />))}
            </div>
          ) : (
            (sessions || []).map((s) => (
              <button key={s.id} className={`w-full text-left px-3 py-2 rounded-lg border mb-2 transition-all duration-200 ${sessionId===s.id? 'bg-blue-600/20 border-blue-500/50 text-blue-300' : 'border-slate-600 text-slate-300 hover:bg-slate-800/60 hover:border-slate-500'}`} onClick={() => loadSessionMessages(s.id)}>
                <div className="text-sm font-medium">Session {String(s.id).slice(-8)}</div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col bg-background">
        <header className="border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="text-sm text-muted-foreground" onClick={() => navigate('/dashboard')}>← Dashboard</button>
            <h1 className="text-lg font-semibold text-slate-100">AI Agent: {agentId}</h1>
          </div>
        </header>

        {error && <div className="px-4 py-2 text-red-500 text-sm">{error}</div>}

        <main className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Đang khởi tạo...</div>
          ) : (
            <>
              {messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={`inline-block px-4 py-2.5 rounded-xl max-w-[75%] ${m.role === 'user' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800/60 text-slate-100 border border-slate-700/50'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="text-left">
                  <div className="inline-block px-4 py-3 rounded-xl bg-slate-800/40 border border-blue-500/30">
                    <AgentTypingIndicator />
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        <footer className="border-t border-border p-3 flex gap-2">
          <Textarea
            className="flex-1 bg-background text-foreground placeholder:text-muted-foreground border border-border"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={sending || !sessionId}
            rows={1}
          />
          <Button className="bg-primary text-primary-foreground hover:opacity-90" onClick={handleSend} disabled={sending || !input.trim() || !sessionId}>Gửi</Button>
        </footer>
      </div>
    </div>
  );
};

export default AIAgentChat;


