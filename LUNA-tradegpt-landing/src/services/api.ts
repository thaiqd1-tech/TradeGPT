/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

// List all groups for the current user
export const listUserGroups = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const res = await fetch(`${API_BASE_URL}/user/groups`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch user groups');
  return res.json();
};

import { AgentsByFoldersFilters } from "../hooks/useAgentsByFolders";
import {
  Workspace,
  Agent,
  ModelConfig,
  Thread,
  ChatMessage,
  ApiMessage,
  ApiTaskType,
  User,
  TaskRun,
  CreateOrderRequest,
  CreateOrderResponse,
  CaptureOrderRequest,
  CaptureOrderResponse,
  CreditTransaction,
} from "../types/index.ts";
import { handleApiError } from "../utils/errorHandler";
import apiClient from '../utils/apiClient';

export const registerWithEmail = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) => {
  const res = await fetch(API_ENDPOINTS.auth.register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const registerWithGoogle = async () => {
  const res = await fetch(API_ENDPOINTS.auth.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const loginWithGoogle = async (idToken: string) => {
  const res = await fetch(API_ENDPOINTS.auth.google, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

// Thêm các hàm API khác ở đây
export const createWorkspace = async (workspaceData: {
  name: string;
  businessType: string;
  language: string;
  location: string;
  description: string;
  products?: string;
  url?: string;
  logo?: File;
}): Promise<{ data: Workspace }> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.workspace.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(workspaceData),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const getAgents = async (
  workspace_id: string,
  page: number = 1,
  page_size: number = 10,
  search?: string
): Promise<any> => {
  const token = localStorage.getItem("token");
  let url = `${API_BASE_URL}/agents/all?workspace_id=${workspace_id}&page=${page}&page_size=${page_size}`;
  if (search && search.trim() !== "") {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const createAgent = async (agentData: {
  name: string;
  workspace_id: string;
  folder_id: string;
  role_description: string;
  job_brief: string;
  language: string;
  position: string;
  status: string;
  greeting_message?: string;
  model_config?: ModelConfig;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.agents.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(agentData),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const sendChatMessage = async (agentId: string, message: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.agents.chat, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ agentId, message }),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export interface FolderResponse {
  data: {
    id: string;
    name: string;
    workspace_id: string;
    created_at: string;
    updated_at: string;
  }[];
}

export const getFolders = async (
  workspaceId: string
): Promise<FolderResponse> => {
  if (!workspaceId) throw new Error("Không tìm thấy workspace");

  const response = await apiClient.request(`${API_BASE_URL}/folders/list`, {
    method: "POST",
    body: JSON.stringify({ workspace_id: workspaceId }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface WorkspaceResponse {
  data: Workspace[] | null;
  status: number;
}

export const getWorkspace = async (): Promise<WorkspaceResponse> => {
  const res = await apiClient.request(`${API_BASE_URL}/workspaces`);
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export interface CreateFolderRequest {
  name: string;
  description: string;
  folder_type: "custom";
  status: "workspace_shared" | "system_shared";
  workspace_id?: string;
}

export const createFolder = async (
  folderData: CreateFolderRequest
): Promise<{ data: FolderResponse["data"][0] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/folders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(folderData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface FolderDetailResponse {
  data: {
    id: string;
    name: string;
    workspace_id: string;
    description?: string;
    order?: number;
    pin?: number;
    status?: number;
  };
}

export const getFolderDetail = async (
  folderId: string,
  workspaceId: string
): Promise<FolderDetailResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  order?: number;
  pin?: number;
  status?: string;
  folder_type?: string;
}

export const updateFolder = async (
  folderId: string,
  folderData: UpdateFolderRequest
): Promise<{ data: FolderDetailResponse["data"] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(folderData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const deleteFolder = async (
  folderId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return { success: true };
};

export const getAgentsByFolder = async (folderId: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.agents.byFolder, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ folder_id: folderId }),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

export const getAgentById = async (
  agentId: string
): Promise<{ data: Agent }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const response = await fetch(API_ENDPOINTS.agents.getById(agentId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface UpdateAgentRequest {
  name?: string;
  role_description?: string;
  job_brief?: string;
  language?: string;
  position?: string;
  status?: string;
  model_config?: ModelConfig;
  folder_id?: string;
  greeting_message?: string;
}

export const updateAgent = async (
  agentId: string,
  agentData: UpdateAgentRequest
): Promise<{ data: Agent }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.agents.update(agentId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(agentData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const deleteAgent = async (
  agentId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_ENDPOINTS.agents.delete(agentId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  // Assuming the delete endpoint returns a success indicator, adjust if needed.
  // For simplicity, assuming a successful response means deletion was successful.
  return { success: response.ok };
};

export interface WorkspaceProfile {
  workspace_id: string;
  brand_name: string;
  business_type: string;
  default_language_code: string;
  default_location_code: string;
  brand_description: string;
  brand_products_services: string;
  website_url?: string;
  brand_logo_url?: string;
}

export const createWorkspaceProfile = async (
  profileData: WorkspaceProfile
): Promise<{ data: WorkspaceProfile }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.workspace.profile(profileData.workspace_id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getWorkspaceProfile = async (
  workspaceId: string
): Promise<{ data: WorkspaceProfile | null }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    API_ENDPOINTS.workspace.getProfile(workspaceId),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Handle 404 specifically - means profile doesn't exist
  if (response.status === 404) {
    return { data: null };
  }

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const updateWorkspaceProfile = async (
  workspaceId: string,
  profileData: Partial<WorkspaceProfile>
): Promise<{ data: WorkspaceProfile }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    API_ENDPOINTS.workspace.updateProfile(workspaceId),
    {
      method: "PUT", // Hoặc PATCH tùy thuộc vào API server
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const createThread = async (threadData: {
  workspace_id: string;
  agent_id: string;
  title: string;
}): Promise<{ data: Thread }> => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.threads.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(threadData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const checkThreadExists = async (
  agentId: string,
  workspaceId: string
): Promise<{ exists: boolean; thread_id?: string }> => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_ENDPOINTS.threads.check}?agent_id=${agentId}&workspace_id=${workspaceId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    // Handle non-200 responses, perhaps the API returns 404 if not found
    if (response.status === 404) {
      return { exists: false };
    }
    await handleApiError(response);
    throw new Error("Lỗi khi kiểm tra thread tồn tại");
  }

  const data = await response.json();
  return data;
};

// New function to send message to thread
export const sendMessageToThread = async (
  threadId: string,
  messageContent: string
): Promise<{ data: ChatMessage }> => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await apiClient.request(`${API_BASE_URL}/threads/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      thread_id: threadId,
      message_content: messageContent,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getThreadMessages = async (
  threadId: string
): Promise<{ data: ApiMessage[] }> => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.threads.messages(threadId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getTasksByAgentId = async (
  agentId: string
): Promise<{ data: ApiTaskType[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found.");

  const response = await fetch(`${API_ENDPOINTS.tasks.base}/agent/${agentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
// Lấy danh sách task theo agentId
export const getAgentTasks = async (agentId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const res = await fetch(`${API_BASE_URL}/tasks/agent/${agentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Lỗi khi lấy danh sách task");
  return res.json();
};

export const createTask = async (
  taskData: Omit<ApiTaskType, "id" | "created_at" | "updated_at"> & {
    agent_id: string;
  }
): Promise<{ data: ApiTaskType }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found.");

  const response = await fetch(API_ENDPOINTS.tasks.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  task_type?: string;
  execution_config?: Record<string, unknown>;
  credit_cost?: number;
  category?: string;
  is_system_task?: boolean;
  assignedAgentId?: string;
  status?: "todo" | "in-progress" | "completed";
}

export const updateTask = async (
  taskId: string,
  taskData: UpdateTaskRequest
): Promise<{ data: ApiTaskType }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found.");

  const response = await fetch(API_ENDPOINTS.tasks.update(taskId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// New function to execute a task
export const executeTask = async (
  taskId: string,
  inputData: { [key: string]: string },
  threadId: string
): Promise<{
  message: string;
  status: number;
  task_run_id?: string;
  webhook_response?: any;
}> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const userStr = localStorage.getItem("user");
  if (!userStr) throw new Error("Không tìm thấy thông tin người dùng");
  const user = JSON.parse(userStr);

  const body: any = {
    task_id: taskId,
    input_data: inputData,
    thread_id: threadId,
    user_id: user.id,
  };

  const response = await fetch(API_ENDPOINTS.tasks.execute, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const deleteTask = async (
  taskId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found.");

  const response = await fetch(API_ENDPOINTS.tasks.delete(taskId), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return { success: response.ok };
};

export interface Invitation {
  ID: string;
  WorkspaceID: string;
  InviterID: string;
  InviteeUserID: string | null;
  InviteeEmail: string;
  Role: string;
  Status: "pending" | "accepted" | "rejected";
  Token: string;
  ExpiresAt: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string;
  type: "invitation"; // Assuming only invitation type for now
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const getNotifications = async (): Promise<{ data: Notification[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_ENDPOINTS.workspace.getNotifications}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const markAllNotificationsAsRead = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_ENDPOINTS.workspace.markAllNotificationsAsRead}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const markNotificationAsRead = async (notificationId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_ENDPOINTS.workspace.getNotifications}/${notificationId}/read`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getAllInvitations = async (): Promise<{ data: Invitation[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/workspaces/me/invitations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const acceptInvitation = async (
  invitationId: string
): Promise<{ message: string; status: number }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.workspace.acceptInvitation(invitationId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const rejectInvitation = async (
  invitationId: string
): Promise<{ message: string; status: number }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.workspace.rejectInvitation(invitationId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const inviteMember = async (
  workspaceId: string,
  email: string,
  role: string,
  message: string
): Promise<{ message: string; status: number }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.workspace.inviteMember(workspaceId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        invitee_email: email,
        role: role,
        message: message,
      }),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user_name: string;
  user_email: string;
  id: string;
  name: string;
  email: string;
}

export const getWorkspaceMembers = async (
  workspaceId: string
): Promise<{ data: WorkspaceMember[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_ENDPOINTS.workspace.getMembers(workspaceId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// New function to remove a workspace member
export const removeWorkspaceMember = async (
  workspaceId: string,
  memberId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}/workspaces/${workspaceId}/members/${memberId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json", // Include Content-Type header
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return { success: response.ok };
};

export const getThreadByAgentId = async (
  agentId: string
): Promise<{ data: Thread[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.threads.getByAgentId(agentId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// New function to get threads for a workspace
export const getThreads = async (
  workspaceId: string
): Promise<{ data: Thread[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/threads/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ workspace_id: workspaceId }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getThreadById = async (
  threadId: string
): Promise<{ data: Thread }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.threads.getById(threadId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getTaskRunsByThreadId = async (
  user_id: string,
  agent_id: string
): Promise<{ data: TaskRun[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.tasks.excuteHistory, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: user_id,
      agent_id: agent_id,
    }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const assignAgentToFolder = async (
  agentId: string,
  folderId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.agents.assignToFolder(agentId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ folder_id: folderId }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Create system prompt template for an agent
export const createSystemPrompt = async (promptData: {
  agent_id: string;
  name: string;
  description: string;
  template_content: string;
  category: string;
  template_type: string;
  is_featured: boolean;
  order_index: number;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.promptTemplates.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(promptData),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

// Get prompt templates by agent
export interface PromptTemplate {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  template_content: string;
  category: {
    String: string;
    Valid: boolean;
  } | string;
  template_type: string;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PromptTemplatesResponse {
  data: PromptTemplate[];
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
}

export const getPromptTemplatesByAgent = async (
  agentId: string,
  params: {
    limit?: number;
    offset?: number;
    template_type?: string;
    search?: string;
    category?: string;
  } = {}
): Promise<PromptTemplatesResponse> => {
  const token = localStorage.getItem("token");
  const { limit = 10, offset = 0, template_type, search, category } = params;
  
  const queryParams = new URLSearchParams({
    template_type: template_type || 'user_prompt',
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (search) queryParams.append('search', search);
  if (category) queryParams.append('category', category);
  
  const res = await fetch(
    `${API_BASE_URL}/prompt-templates/by-agent/${agentId}?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

// Render a prompt template
export const renderPromptTemplate = async (
  templateId: string,
  data: {
    agent_id: string;
    workspace_id: string;
  }
): Promise<{ rendered_content: string }> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.promptTemplates.render(templateId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await handleApiError(res);
  }

  return res.json();
};

// Update getAllPromptTemplates to use new API params
export const getAllPromptTemplates = async (
  page = 1,
  page_size = 10,
  template_type?: string
) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(page_size),
  });
  if (template_type) params.append("template_type", template_type);
  const res = await fetch(
    `${API_BASE_URL}/prompt-templates/all?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const updatePromptTemplate = async (
  id: string,
  data: Partial<PromptTemplate>
) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/prompt-templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const deletePromptTemplate = async (id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/prompt-templates/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  // Nếu là 204 No Content thì không cần parse json
  if (res.status === 204) return;
  return res.json();
};

export const clearAgentThreadHistory = async (
  agent_id: string,
  workspace_id: string
) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${API_BASE_URL}/threads/clear?agent_id=${encodeURIComponent(
      agent_id
    )}&workspace_id=${encodeURIComponent(workspace_id)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    await handleApiError(res);
  }
  if (res.status === 204) return;
  return res.json();
};

// Gửi message kèm nhiều file lên thread
export const uploadMessageWithFiles = async (
  threadId: string,
  messageContent: string,
  files: File[],
  optimisticId: string
): Promise<{ data: any }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const formData = new FormData();
  formData.append("message_content", messageContent);
  files.forEach((file) => {
    if (file.type.startsWith("image/")) {
      formData.append("images", file);
    } else {
      formData.append("files", file);
    }
  });
  formData.append("optimistic_id", optimisticId);
  const response = await fetch(
    `${API_BASE_URL}/threads/${threadId}/messages/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Không set Content-Type, để browser tự set boundary cho multipart/form-data
      },
      body: formData,
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// ========== CREDENTIALS API ==========
export const createCredential = async (data: {
  provider: string;
  name: string;
  credential: object;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.credentials.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const getCredentials = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.credentials.list, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const updateCredential = async (id: string, data: object) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.credentials.update(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const deleteCredential = async (
  id: string,
  provider: string,
  name: string
) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.credentials.delete(id), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ provider, name }),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return { success: res.ok };
};

// Lấy agents theo nhiều folder
export interface AgentsByFoldersResponse {
  data: {
    id: string;
    name: string;
    workspace_id: string;
    agents: Agent[];
    pagination: {
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }[];
}

export const getAgentsByFolders = async (
  folderIds: string[],
  page: number = 1,
  pageSize: number = 10,
  filters?: AgentsByFoldersFilters
): Promise<AgentsByFoldersResponse> => {
  const workspaceId = localStorage.getItem("selectedWorkspace");
  if (!workspaceId) throw new Error("Không tìm thấy workspace");

  const res = await apiClient.request(`${API_BASE_URL}/agents/by-folders`, {
    method: "POST",
    body: JSON.stringify({
      folder_ids: folderIds,
      workspace_id: workspaceId,
      page,
      page_size: pageSize,
      filters,
    }),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const scrapWorkspaceProfile = async ({
  workspace_id,
  website_url,
}: {
  workspace_id: string;
  website_url: string;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.workspace.scrapUrl(workspace_id), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ website_url }),
  });
  if (!res.ok)
    throw new Error("Không thể lấy thông tin doanh nghiệp từ website");
  return res.json();
};

export const getSubflowLogPairs = async (thread_id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${API_BASE_URL}/logs/subflow/pairs?thread_id=${thread_id}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Không thể lấy log subflow pairs");
  return res.json();
};

export const deleteThread = async (
  threadId: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

// ========== SCHEDULED TASKS API ==========

// Types cho Scheduled Tasks
export interface ScheduledTask {
  id: string;
  user_id: string;
  agent_id: string;
  workspace_id: string;
  task_id: string;
  name: string;
  description: string;
  schedule_type: "daily" | "weekly" | "monthly" | "custom";
  schedule_config: {
    time?: string;
    day_of_week?: number;
    day_of_month?: number;
    cron_expression?: string;
  };
  status: "active" | "paused";
  is_enabled: boolean;
  last_run_at?: string;
  next_run_at?: string;
  total_runs?: number;
  successful_runs?: number;
  failed_runs?: number;
  conversation_template?: {
    input_data: Record<string, any>;
  };
  auto_create_conversation: boolean;
  created_at: string;
  updated_at: string;
}

export interface RunningTask {
  id: string;
  task_id: string;
  thread_id: string;
  user_id: string;
  start_time: string;
  status: "running" | "completed" | "failed";
  is_scheduled: boolean;
  created_at: string;
}

export interface CreateScheduledTaskRequest {
  agent_id: string;
  workspace_id: string;
  task_id: string;
  name: string;
  description: string;
  schedule_type: "daily" | "weekly" | "monthly" | "custom";
  schedule_config: {
    time?: string;
    day_of_week?: number;
    day_of_month?: number;
    cron_expression?: string;
  };
  auto_create_conversation: boolean;
  conversation_template?: {
    input_data: Record<string, any>;
  };
}

export interface UpdateScheduledTaskRequest {
  name?: string;
  description?: string;
  schedule_config?: {
    time?: string;
    day_of_week?: number;
    day_of_month?: number;
    cron_expression?: string;
  };
  is_enabled?: boolean;
  status?: "active" | "paused";
  conversation_template?: {
    input_data: Record<string, any>;
  };
}

// 1. Lấy số lượng task đang chạy
export const getRunningTasksCount = async (): Promise<{
  data: { running_count: number };
}> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/tasks/running/count`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 2. Lấy danh sách task đang chạy
export const getRunningTasksList = async (): Promise<{
  data: RunningTask[];
}> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/tasks/running/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 3. Tạo task theo lịch trình
export const createScheduledTask = async (
  taskData: CreateScheduledTaskRequest
): Promise<{ data: ScheduledTask }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/tasks/scheduled`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 4. Lấy danh sách scheduled tasks
export const getScheduledTasks = async (): Promise<{
  data: ScheduledTask[];
}> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(`${API_BASE_URL}/tasks/scheduled`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 5. Lấy chi tiết 1 scheduled task
export const getScheduledTaskById = async (
  scheduledTaskId: string
): Promise<{ data: ScheduledTask }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}/tasks/scheduled/${scheduledTaskId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 6. Chỉnh sửa scheduled task
export const updateScheduledTask = async (
  scheduledTaskId: string,
  taskData: UpdateScheduledTaskRequest
): Promise<{ data: ScheduledTask }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}/tasks/scheduled/${scheduledTaskId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 6.1. Cập nhật status của scheduled task
export const updateScheduledTaskStatus = async (
  scheduledTaskId: string,
  status: "active" | "paused",
  is_enabled?: boolean
): Promise<{ data: ScheduledTask }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const payload: any = { status };
  if (is_enabled !== undefined) {
    payload.is_enabled = is_enabled;
  }

  const response = await fetch(
    `${API_BASE_URL}/tasks/scheduled/${scheduledTaskId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 7. Bật scheduled task
export const enableScheduledTask = async (
  scheduledTaskId: string
): Promise<{ message: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}/tasks/scheduled/${scheduledTaskId}/enable`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 7. Tắt scheduled task
export const disableScheduledTask = async (
  scheduledTaskId: string
): Promise<{ message: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}/tasks/scheduled/${scheduledTaskId}/disable`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 8. Chạy ngay 1 scheduled task
export const runScheduledTaskNow = async (
  scheduledTaskId: string
): Promise<{
  message: string;
  status: number;
  task_run_id?: string;
  webhook_response?: any;
}> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}/tasks/scheduled/${scheduledTaskId}/run-now`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 9. Lấy lịch sử thực thi của 1 scheduled task
export const getScheduledTaskRuns = async (
  scheduledTaskId: string
): Promise<{ data: TaskRun[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}/tasks/scheduled/${scheduledTaskId}/runs`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 10. Xóa scheduled task
export const deleteScheduledTask = async (
  scheduledTaskId: string
): Promise<{ message: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(
    `${API_BASE_URL}/tasks/scheduled/${scheduledTaskId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// ========== PAYMENT API ==========
export const createPayPalOrder = async (
  data: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.payment.createOrder, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const capturePayPalOrder = async (
  data: CaptureOrderRequest
): Promise<CaptureOrderResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.payment.captureOrder, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getTransactionHistory = async (
  page = 1,
  page_size = 20,
  type?: string
) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  let url = `${API_ENDPOINTS.payment.getTransactionHistory}?page=${page}&page_size=${page_size}`;
  if (type && type !== "all") url += `&type=${type}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    await handleApiError(response);
  }
  return response.json();
};

export const getPublicAgents = async (page = 1, pageSize = 10, search = "") => {
  const res = await apiClient.request(
    `${API_BASE_URL}/agents/public?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(
      search
    )}`
  );
  if (!res.ok) throw new Error("Failed to fetch public agents");
  return res.json();
};

// ========== KNOWLEDGE API ==========

// 1. Upload knowledge file
export const uploadKnowledge = async (
  file: File,
  agent_id: string,
  workspace_id: string,
  status: string
): Promise<any> => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("agent_id", agent_id);
  formData.append("workspace_id", workspace_id);
  formData.append("status", status);
  const res = await fetch(API_ENDPOINTS.knowledge.create, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  if (!res.ok) throw new Error("Lỗi upload file tri thức");
  return res.json();
};

// 2. List knowledge
export const listKnowledge = async (params: {
  agent_id?: string;
  workspace_id?: string;
  status?: string;
}): Promise<any> => {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams();
  if (params.agent_id) query.append("agent_id", params.agent_id);
  if (params.workspace_id) query.append("workspace_id", params.workspace_id);
  if (params.status) query.append("status", params.status);
  const url = `${API_ENDPOINTS.knowledge.list}?${query.toString()}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Lỗi lấy danh sách tri thức");
  return res.json();
};

// 3. Update knowledge
export const updateKnowledge = async (data: {
  id: string;
  title?: string;
  content?: string;
  status?: string;
}): Promise<any> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.knowledge.update, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi cập nhật tri thức");
  return res.json();
};

// 4. Delete knowledge
export const deleteKnowledge = async (id: string): Promise<any> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.knowledge.delete(id), {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Lỗi xóa tri thức");
  return res.json();
};

// Lấy chi tiết knowledge
export const getKnowledgeDetail = async (id: string): Promise<any> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.knowledge.getById(id), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Lỗi lấy chi tiết tri thức");
  return res.json();
};

// ========== FORGOT PASSWORD API ==========
export const forgotPassword = async (email: string) => {
  const res = await fetch(API_ENDPOINTS.auth.forgotPassword, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const verifyEmail = async (email: string, code: string) => {
  const res = await fetch(API_ENDPOINTS.auth.verifyEmail, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

export const verifyForgotPassword = async (email: string, code: string) => {
  const res = await fetch(API_ENDPOINTS.auth.verifyForgotPassword, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return res.json();
};

export const resetPassword = async (email: string, code: string, new_password: string) => {
  const res = await fetch(API_ENDPOINTS.auth.resetPassword, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, new_password }),
  });
  return res.json();
};

// ========== GIFTCODE API ==========

export interface Giftcode {
  code: string;
  credit: number;
  quantity?: number;
  expired_at: string;
  created_at?: string;
  updated_at?: string;
  used_by?: string[];
}

export interface GiftcodeResponse {
  data: Giftcode | null;
  status: number;
}

// 1. Tạo giftcode mới (admin)
export const createGiftcode = async (giftcodeData: {
  code: string;
  credit: number;
  quantity?: number;
  expired_at: string;
}): Promise<{ data: Giftcode }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const res = await fetch(`${API_BASE_URL}/admin/giftcode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(giftcodeData),
  });
  if (!res.ok) await handleApiError(res);
  return res.json();
};

// 2. Lấy danh sách tất cả giftcode (admin)
export const getAllGiftcodes = async (): Promise<{ data: Giftcode[] }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const res = await fetch(`${API_BASE_URL}/admin/giftcode`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) await handleApiError(res);
  return res.json();
};

// 3. Xem chi tiết 1 giftcode (admin)
export const getGiftcodeDetail = async (
  code: string
): Promise<{ data: Giftcode }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const res = await fetch(
    `${API_BASE_URL}/admin/giftcode/${encodeURIComponent(code)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) await handleApiError(res);
  return res.json();
};

// 4. Cập nhật giftcode (admin)
export const updateGiftcode = async (
  code: string,
  data: { credit?: number; quantity?: number; expired_at?: string }
): Promise<{ data: Giftcode }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const res = await fetch(
    `${API_BASE_URL}/admin/giftcode/${encodeURIComponent(code)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) await handleApiError(res);
  return res.json();
};

// 5. Xoá giftcode (admin)
export const deleteGiftcode = async (
  code: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const res = await fetch(
    `${API_BASE_URL}/admin/giftcode/${encodeURIComponent(code)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) await handleApiError(res);
  return { success: res.ok };
};

// 6. User nhập giftcode để nhận credit
export const redeemGiftcode = async (
  code: string
): Promise<{ message: string; credit?: number; success?: boolean }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");
  const res = await fetch(`${API_BASE_URL}/giftcode/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) await handleApiError(res);
  const data = await res.json();
  return {
    message: data.message,
    credit: data.credit,
    success: typeof data.success === "boolean" ? data.success : undefined,
  };
};

export const saveAgentPlan = async (payload: {
  agent_role: string;
  sessionId: string;
  user_id: string;
  parent_message_id: string;
  thread_id: string;
  agent_tool_calling?: string;
  agent_tool_executing?: string;
  subflow_id?: string;
  sender_id: string;
  receiver_id: string;
  workspace_id: string;
  agent_id: string;
  is_save_plan: string;
  content: string;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/agents/save-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    await handleApiError(res);
  }
  return res.json();
};

// Lấy danh sách các gói subscription
export const getPlans = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.plans.list, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách gói");
  return res.json();
};

// Đăng ký gói subscription
export const subscribePlan = async (user_id: string, plan_id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.plans.subscribe, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ user_id, plan_id }),
  });
  if (!res.ok) throw new Error("Không thể đăng ký gói");
  return res.json();
};

// Xác nhận subscription thành công sau khi thanh toán PayPal
export const notifySubscriptionSuccess = async (
  paypal_subscription_id: string,
  plan_id: string
) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/subscription/success`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      paypal_subscription_id,
      plan_id,
    }),
  });
  if (!res.ok) throw new Error("Không thể xác nhận subscription!");
  return res.json();
};

// Lấy thông tin subscription hiện tại của user
export const getUserSubscription = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/user/subscription`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Không thể lấy thông tin subscription!");
  return res.json();
};

// ========== GROUP API ========== //
export interface Group {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  user_id: string;
  user_name: string;
  user_email: string;
  role: "owner" | "admin" | "member";
}

export const createGroup = async (data: {
  workspace_id: string;
  name: string;
  description?: string;
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.group.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const getGroups = async (workspace_id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.group.list(workspace_id), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const getGroupMembers = async (groupId: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.group.getMembers(groupId), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const addGroupMember = async (
  groupId: string,
  data: { user_id: string; role: "admin" | "member" }
) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.group.addMember(groupId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const removeGroupMember = async (groupId: string, userId: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.group.removeMember(groupId, userId), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const transferGroupOwner = async (
  groupId: string,
  new_owner_id: string
) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.group.transferOwner(groupId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ new_owner_id }),
  });
  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const updateGroupMemberRole = async (
  groupId: string,
  userId: string,
  role: "admin" | "member"
) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_ENDPOINTS.group.updateRole(groupId, userId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) await handleApiError(res);
  return res.json();
};

// ==================== BLOG API FUNCTIONS ====================
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author_id: string;
  author_name: string;
  status: "draft" | "published" ;
  tags?: string[];
  image_url?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  reaction_count?: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  parent_id?: string;
  user_id: string;
  user_name: string;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogReactionSummary {
  post_id: string;
  like_count: number;
  love_count: number;
  haha_count: number;
  wow_count: number;
  sad_count: number;
  angry_count: number;
  total_count: number;
}

export interface BlogStats {
  post_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  average_rating: number;
  rating_count: number;
}

// Create a new blog post (super_admin only)
export const createBlogPost = async (postData: {
  title: string;
  content: string;
  summary?: string;
  status: "draft" | "published";
  tags?: string[];
  image_url?: string;
}): Promise<{ message: string; post: BlogPost }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.blog.posts, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Get all blog posts (public)
export const getBlogPosts = async (params?: {
  status?: "draft" | "published" | "archived";
  limit?: number;
  offset?: number;
  page?: number;
  search?: string;
  tags?: string;
}): Promise<{
  success: boolean;
  data: {
    posts: BlogPost[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.tags) queryParams.append("tags", params.tags);
  const token = localStorage.getItem("token");

  const url = `${API_ENDPOINTS.blog.posts}?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Get single blog post (public)
export const getBlogPost = async (postId: string): Promise<{ data: BlogPost }> => {
  const token = localStorage.getItem("token");
  const response = await fetch(API_ENDPOINTS.blog.getPost(postId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,

    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Update blog post (super_admin only)
export const updateBlogPost = async (
  postId: string,
  postData: {
    title?: string;
    content?: string;
    summary?: string;
    status?: "draft" | "published" | "archived";
    tags?: string[];
    image_url?: string;
  }
): Promise<{ message: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.blog.updatePost(postId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Delete blog post (super_admin only)
export const deleteBlogPost = async (postId: string): Promise<{ message: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.blog.deletePost(postId), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Add comment to blog post (authenticated users)
export const addBlogComment = async (
  postId: string,
  commentData: {
    content: string;
    parent_id?: string;
  }
): Promise<{ message: string; comment: BlogComment }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.blog.comments(postId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(commentData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Get comments for blog post (public)
export const getBlogComments = async (
  postId: string,
  params?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ data: BlogComment[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  const token = localStorage.getItem("token");

  const url = `${API_ENDPOINTS.blog.comments(postId)}?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,

    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Add/update reaction to blog post (authenticated users)
export const addBlogReaction = async (
  postId: string,
  reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry"
): Promise<{ message: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.blog.reactions(postId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type: reactionType }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Remove reaction from blog post (authenticated users)
export const removeBlogReaction = async (postId: string): Promise<{ message: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.blog.reactions(postId), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Get reaction summary for blog post (public)
export const getBlogReactions = async (postId: string): Promise<BlogReactionSummary> => {
  const token = localStorage.getItem("token");

  const response = await fetch(API_ENDPOINTS.blog.reactions(postId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,

    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Add/update rating for blog post (authenticated users)
export const addBlogRating = async (
  postId: string,
  score: number
): Promise<{ message: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Không tìm thấy token");

  const response = await fetch(API_ENDPOINTS.blog.rating(postId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Get blog post stats (public)
export const getBlogStats = async (postId: string): Promise<BlogStats> => {
  const response = await fetch(API_ENDPOINTS.blog.stats(postId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// ==================== USER FILES API FUNCTIONS ====================
export interface UserFile {
  id: string;
  user_id: string;
  user_name: string;
  workspace_id: string;
  thread_id?: string;
  file_name: string;
  file_type: "image" | "document" | "video" | "audio" | "other";
  file_url: string;
  file_size: number;
  mime_type: string;
  purpose: "profile_picture" | "document" | "attachment" | "general";
  visibility: "private" | "public" | "group";
  tags: string[];
  shared_with: string[];
  created_at: string;
  updated_at: string;
}

export interface UserFilesResponse {
  files: UserFile[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UserFileFilters {
  file_type?: string;
  purpose?: string;
  visibility?: string;
  tags?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Create user file (upload)
export const createUserFile = async (
  file: File,
  threadId?: string,
  purpose?: string,
  tags?: string[],
  visibility?: string
): Promise<UserFile> => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  
  formData.append('file', file);
  if (threadId) formData.append('thread_id', threadId);
  if (purpose) formData.append('purpose', purpose);
  if (visibility) formData.append('visibility', visibility);
  if (tags && tags.length > 0) {
    tags.forEach(tag => formData.append('tags', tag));
  }

  const response = await fetch(API_ENDPOINTS.userFiles.create, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Get user files with filters and pagination
export const getUserFiles = async (filters: UserFileFilters = {}): Promise<UserFilesResponse> => {
  const token = localStorage.getItem("token");
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_ENDPOINTS.userFiles.list}?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Get user file by ID
export const getUserFileById = async (id: string): Promise<UserFile> => {
  const token = localStorage.getItem("token");
  const response = await fetch(API_ENDPOINTS.userFiles.getById(id), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Update user file metadata
export const updateUserFile = async (
  id: string,
  updates: Partial<Pick<UserFile, 'file_name' | 'purpose' | 'tags' | 'visibility'>>
): Promise<UserFile> => {
  const token = localStorage.getItem("token");
  const response = await fetch(API_ENDPOINTS.userFiles.update(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Delete user file
export const deleteUserFile = async (id: string): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(API_ENDPOINTS.userFiles.delete(id), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};

// Share user file
export const shareUserFile = async (
  id: string,
  shareData: {
    shared_with: string[];
    can_edit?: boolean;
    visibility: "group" | "public";
  }
): Promise<UserFile> => {
  const token = localStorage.getItem("token");
  const response = await fetch(API_ENDPOINTS.userFiles.share(id), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(shareData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
