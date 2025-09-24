import { Agent, AgentsResponse, ChatRequest, SessionCreateRequest, SessionCreateResponse, SessionEventsResponse } from '../types/ai.types';
import { getAIServiceToken } from '../utils/aiUtils';
import { aiApiClient, aiStreamApiClient } from '../utils/apiClient';
import { fetchEventSource } from '@microsoft/fetch-event-source';
class AIService {
    private currentSession: string | null = null;
    private currentUser: {id: string, name: string} | null = null;
    public setCurrentUser (userId: string, username: string) {
        this.currentUser = {id: userId, name: username};
    }


    public async createSession (userId?: string, username?: string):Promise<SessionCreateResponse> {
        this.setCurrentUser(userId || '', username || '');
        const requestBody: SessionCreateRequest = {
            metadata: {additionalProp1: {}}
        }
        const aiToken = await getAIServiceToken(this.currentUser);
        const sessionData = await aiApiClient<SessionCreateResponse> ('/session/create', {
            method: 'Post',
            headers: {
                'Authorization': `Bearer ${aiToken}`
            },
            body: JSON.stringify(requestBody)
        })
        this.currentSession = sessionData.session_id;
        // console.log('Session created successfully:', sessionData);
        return sessionData;
    }

    public getCurrentSession(): string | null {
        return this.currentSession;
      }

      public setCurrentSession(sessionId: string): void {
        this.currentSession = sessionId;
      }

      public async getAgents(): Promise<AgentsResponse> { 
        console.log(' [aiService] getAgents() called - URL will be: /agents/alls');
        const result = await aiApiClient<AgentsResponse>('/agents/alls',{
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await getAIServiceToken(this.currentUser)}`
          }
        });
        console.log(' [aiService] getAgents() response:', result);
        return result;
      }

      public async getAgent(agentId: string): Promise<Agent | null> {
        try {
          const aiToken = await getAIServiceToken(this.currentUser);
          return aiApiClient<Agent>(`/agents/detail/${agentId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${aiToken}`
            }
          });
        } catch (error) {
          console.error('Failed to retrieve agent details:', error);
          throw error;
        }
      }

      public async sendMessage(
        request: ChatRequest,
        onChunk: (text: string) => void,
        onClose: () => void, // Thêm callback khi stream đóng
        onError: (error: Error) => void // Thêm callback khi có lỗi
      ): Promise<void> {
        if (!this.currentSession) {
          onError(new Error("Session not initialized"));
          return;
        }
    
        const aiToken = await getAIServiceToken(this.currentUser);
        const url = `${import.meta.env.VITE_AI_SERVICE_BASE_URL}/chat/${this.currentSession}`;
        
        const requestBody = {
          files: [],
          images: [],
          message: request.message,
          metadata: {},
        };
    
        await fetchEventSource(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${aiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
    
          // Hàm được gọi mỗi khi nhận được một sự kiện
          onmessage(event) {
            // Chỉ xử lý các sự kiện có tên 'message_chunk'
            if (event.event === 'message_chunk') {
              const chunkData = JSON.parse(event.data);
              if (chunkData.text) {
                onChunk(chunkData.text);
              }
            }
            // Có thể xử lý sự kiện 'stream_end' ở đây nếu muốn
            if (event.event === 'stream_end') {
              console.log('Stream ended by server.');
              onClose();
            }
          },
    
          // Hàm được gọi khi kết nối được mở
          async onopen(response) {
            if (response.ok) {
              console.log('Connection opened successfully.');
              return; // ok
            }
            // Nếu có lỗi ngay khi mở kết nối (ví dụ: 404, 500)
            throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
          },
    
          // Hàm được gọi khi stream đóng lại
          onclose() {
            console.log('Connection closed by browser or server.');
            onClose();
          },
    
          // Hàm được gọi khi có lỗi
          onerror(err) {
            console.error('EventSource error:', err);
            onError(err);
            // Ném lại lỗi để dừng vòng lặp retry mặc định của thư viện
            throw err;
          },
        });
      }
      public async getChatHistory(agentId: string = 'facebook_marketing_agent'): Promise<any> {
        const aiToken = await getAIServiceToken(this.currentUser);
        return aiApiClient<any>(`/agents/${agentId}/sessions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${aiToken}`
          }
        });
      }

      public async getSessionEvents(sessionId: string): Promise<SessionEventsResponse> {
        const aiToken = await getAIServiceToken(this.currentUser);
        return aiApiClient<SessionEventsResponse>(`/sessions/${sessionId}/events`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${aiToken}`
          }
        });
      }

      public resetSession() {
        this.currentSession = null;
        this.currentUser = null;
      }
    
}

export const aiService = new AIService();
