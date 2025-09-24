// AI and Chat-related types and interfaces

// JWT Types
export interface JWTPayload {
    sub: string;
    username: string;
    user_id: string;
    agent_id: string;
    workspace_id: string;
    role: string;
    user_info: string;
    iat: number;
  }
  
  export interface SessionCreateRequest {
    metadata: {
      [key: string]: any;
    };
  }
  
  export interface SessionCreateResponse {
    session_id: string;
    status: string;
    created_at: string;
  }
  
  // Session Events Types
  export interface SessionEvent {
    id: string;
    app_name: string;
    user_id: string;
    session_id: string;
    invocation_id: string | null;
    author: string;
    branch: string | null;
    timestamp: string;
    content: string;
    actions: any[];
    long_running_tool_ids_json: string | null;
    grounding_metadata: any | null;
    partial: any | null;
    turn_complete: any | null;
    error_code: string | null;
    error_message: string | null;
    interrupted: any | null;
    custom_metadata: any | null;
  }
  
  export interface SessionEventsResponse {
    session_id: string;
    events: SessionEvent[];
    total_count: number;
  }
  
  // AI Agent Types
  export interface Agent {
    id: string;
    name: string;
    description: string;
    avatar?: string;
    capabilities?: string[];
    status?: 'active' | 'inactive';
  }
  
  export interface AgentsResponse {
    agents: Agent[];
    total_count: number;
  }
  
  // Chat Types
  export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    session_id?: string;
  }
  
  export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  }
  
  export interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    agent_id?: string;
  }
  
  // AI Service Request/Response Types
  export interface ChatRequest {
    message: string;
    sessionId?: string;
    userId: string;
    agentId?: string;
  }
  
  export interface ChatResponse {
    chatMessage : string;
    sessionId: string;
    timestamp?: string;
    suggestions?: string[];
    metadata?: any;
  }
  
  export interface ChatHistoryResponse {
    sessions: Array<{
      session_id: string;
      id: string;
      title: string;
      last_message: string;
      created_at: string;
      updated_at: string;
    }>;
  }
  
  // Campaign Analysis Types
  export interface CampaignAnalysis {
    campaignId: string;
    performance: {
      reach: number;
      engagement: number;
      conversions: number;
      ctr: number;
      cpc: number;
    };
    recommendations: string[];
    optimizations: {
      audience: string[];
      budget: string[];
      creative: string[];
    };
  }