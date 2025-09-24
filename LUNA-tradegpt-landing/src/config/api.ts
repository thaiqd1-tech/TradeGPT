export const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL;

export const WS_URL = (import.meta as any).env.VITE_WS_URL || "ws://localhost:3000/ws";

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    google: `${API_BASE_URL}/auth/google/token`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    verifyEmail: `${API_BASE_URL}/auth/verify-email`,
    verifyForgotPassword: `${API_BASE_URL}/auth/verify-forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
  },
  workspace: {
    create: `${API_BASE_URL}/workspaces`,
    profile: (workspaceId: string) =>
      `${API_BASE_URL}/workspaces/${workspaceId}/profile`,
    getProfile: (workspaceId: string) =>
      `${API_BASE_URL}/workspaces/${workspaceId}`,
    updateProfile: (workspaceId: string) =>
      `${API_BASE_URL}/workspaces/${workspaceId}/profile`,
    inviteMember: (workspaceId: string) =>
      `/workspaces/${workspaceId}/invitations`,
    acceptInvitation: (invitationId: string) =>
      `/workspaces/invitations/${invitationId}/accept`,
    rejectInvitation: (invitationId: string) =>
      `/workspaces/invitations/${invitationId}/decline`,
    getMembers: (workspaceId: string) =>
      `${API_BASE_URL}/workspaces/${workspaceId}/members`,
    scrapUrl: (workspaceId: string) =>
      `${API_BASE_URL}/workspaces/${workspaceId}/profile/scrap-url`,
    getNotifications: `${API_BASE_URL}/workspaces/notifications`,
    markAllNotificationsAsRead: `${API_BASE_URL}/workspaces/notifications/mark-all-read`,
  },
  agents: {
    list: `${API_BASE_URL}/agents/all`,
    create: `${API_BASE_URL}/agents`,
    chat: `${API_BASE_URL}/agents/chat`,
    byFolder: `${API_BASE_URL}/agents/by-folder`,
    delete: (id: string) => `${API_BASE_URL}/agents/${id}`,
    getById: (id: string) => `${API_BASE_URL}/agents/${id}`,
    assignToFolder: (id: string) => `${API_BASE_URL}/agents/${id}/folders`,
    update: (id: string) => `${API_BASE_URL}/agents/${id}`,
  },
  tasks: {
    base: `${API_BASE_URL}/tasks`,
    list: `${API_BASE_URL}/tasks/list`,
    create: `${API_BASE_URL}/tasks/create`,
    update: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    delete: (id: string) => `${API_BASE_URL}/tasks/${id}`,

    byAgent: (agentId: string) => `${API_BASE_URL}/tasks/agent/${agentId}`,
    execute: `${API_BASE_URL}/tasks/execute`,
    excuteHistory: `${API_BASE_URL}/tasks/execute-history`,
  },
  folders: {
    create: `${API_BASE_URL}/folders`,
    list: `${API_BASE_URL}/folders`,
    getById: (id: string) => `${API_BASE_URL}/folders/${id}`,
    update: (id: string) => `${API_BASE_URL}/folders/${id}`,
    delete: (id: string) => `${API_BASE_URL}/folders/${id}`,
  },
  threads: {
    create: `${API_BASE_URL}/threads`,
    list: `${API_BASE_URL}/threads`,
    messages: (threadId: string) =>
      `${API_BASE_URL}/threads/${threadId}/messages`,
    check: `${API_BASE_URL}/threads/check`,
    getById: (id: string) => `${API_BASE_URL}/threads/${id}`,
    getByAgentId: (agentId: string) =>
      `${API_BASE_URL}/threads/filter?agent_id=${agentId}`,
  },
  messages: {
    list: `${API_BASE_URL}/messages`,
  },
  promptTemplates: {
    create: `${API_BASE_URL}/prompt-templates`,
    list: `${API_BASE_URL}/prompt-templates`,
    getById: (id: string) => `${API_BASE_URL}/prompt-templates/${id}`,
    update: (id: string) => `${API_BASE_URL}/prompt-templates/${id}`,
    delete: (id: string) => `${API_BASE_URL}/prompt-templates/${id}`,
    byAgent: (agentId: string, limit = 10, offset = 0) =>
      `${API_BASE_URL}/prompt-templates/by-agent/${agentId}?template_type=user_prompt&limit=${limit}&offset=${offset}`,
    render: (id: string) => `${API_BASE_URL}/prompt-templates/${id}/render`,
  },
  credentials: {
    create: `${API_BASE_URL}/credentials`,
    list: `${API_BASE_URL}/credentials`,
    getById: (id: string) => `${API_BASE_URL}/credentials/${id}`,
    update: (id: string) => `${API_BASE_URL}/credentials/${id}`,
    delete: (id: string) => `${API_BASE_URL}/credentials/${id}`,
  },
  payment: {
    createOrder: `${API_BASE_URL}/payment/create-order`,
    captureOrder: `${API_BASE_URL}/payment/capture-order`,
    getTransactionHistory: `${API_BASE_URL}/payment/transactions`,
  },

  knowledge: {
    create: `${API_BASE_URL}/knowledge/upload`,
    list: `${API_BASE_URL}/knowledge/list`,
    getById: (id: string) => `${API_BASE_URL}/knowledge/${id}`,
    update: `${API_BASE_URL}/knowledge/update`,
    delete: (id: string) => `${API_BASE_URL}/knowledge/${id}`,
  },
  plans: {
    list: `${API_BASE_URL}/plans`,
    subscribe: `${API_BASE_URL}/subscribe`,
  },
  artifact: {
    list: (workspaceId: string, ownerId: string) => `${API_BASE_URL}/artifacts?workspace_id=${workspaceId}&owner_id=${ownerId}`,
    getById: (id: string) => `${API_BASE_URL}/artifacts/${id}`,
    create: `${API_BASE_URL}/artifacts`,
    upload: (threadId: string) => `${API_BASE_URL}/artifacts/upload/${threadId}`,
    update: (id: string) => `${API_BASE_URL}/artifacts/${id}`,
    delete: (id: string) => `${API_BASE_URL}/artifacts/${id}`,
    share: (id: string) => `${API_BASE_URL}/artifacts/${id}/share`,
    transferOwner: (id: string) => `${API_BASE_URL}/artifacts/${id}/transfer-owner`,
    importToKnowledgeBase: (id: string) => `${API_BASE_URL}/artifacts/${id}/import-to-knowledge-base`,
    convertToRAG: (id: string) => `${API_BASE_URL}/artifacts/${id}/convert-to-rag`,
  },
  group: {
    create: `${API_BASE_URL}/groups`,
    list: (workspaceId: string) =>
      `${API_BASE_URL}/groups?workspace_id=${workspaceId}`,
    getMembers: (groupId: string) =>
      `${API_BASE_URL}/groups/${groupId}/members`,
    addMember: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/members`,
    removeMember: (groupId: string, userId: string) =>
      `${API_BASE_URL}/groups/${groupId}/members/${userId}`,
    transferOwner: (groupId: string) =>
      `${API_BASE_URL}/groups/${groupId}/transfer-ownership`,
    updateRole: (groupId: string, userId: string) =>
      `${API_BASE_URL}/groups/${groupId}/members/${userId}/role`,
  },
  blog: {
    posts: `${API_BASE_URL}/api/blog/posts`,
    getPost: (postId: string) => `${API_BASE_URL}/api/blog/posts/${postId}`,
    updatePost: (postId: string) => `${API_BASE_URL}/api/blog/posts/${postId}`,
    deletePost: (postId: string) => `${API_BASE_URL}/api/blog/posts/${postId}`,
    comments: (postId: string) => `${API_BASE_URL}/api/blog/posts/${postId}/comments`,
    reactions: (postId: string) => `${API_BASE_URL}/api/blog/posts/${postId}/reactions`,
    rating: (postId: string) => `${API_BASE_URL}/api/blog/posts/${postId}/rating`,
    stats: (postId: string) => `${API_BASE_URL}/api/blog/posts/${postId}/stats`,
  },
  userFiles: {
    create: `${API_BASE_URL}/user-files`,
    list: `${API_BASE_URL}/user-files`,
    getById: (id: string) => `${API_BASE_URL}/user-files/${id}`,
    update: (id: string) => `${API_BASE_URL}/user-files/${id}`,
    delete: (id: string) => `${API_BASE_URL}/user-files/${id}`,
    share: (id: string) => `${API_BASE_URL}/user-files/${id}/share`,
  },
};
