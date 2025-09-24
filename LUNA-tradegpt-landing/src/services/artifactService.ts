import { API_ENDPOINTS, API_BASE_URL } from "../config/api";
import { useAuth } from "../hooks/useAuth.jsx";
export interface Artifact {
  id: string;
  owner_id: string;
  workspace_id: string;
  file_type: 'rag' | 'table' | 'file' | 'image' | 'video' | 'link' | 'artifact';
  file_url: string;
  is_ai: boolean;
  tags: string[];
  shared_with: string[];
  can_edit: boolean;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  owner_name: string;
  file_name: string;
}
export const artifactService = {
  
  async getArtifacts(
    workspaceId: string, 
    ownerId: string,
    options?: {
      page?: number;
      limit?: number;
      file_type?: string;
      search?: string;
      visibility?: 'public' | 'private';
    }
  ): Promise<{ artifacts: Artifact[]; total: number; page: number; limit: number }> {
    const token = localStorage.getItem("token");
    
    // Xây dựng query parameters
    const params = new URLSearchParams({
      workspace_id: workspaceId,
      ...(options?.page && { page: options.page.toString() }),
      ...(options?.limit && { limit: options.limit.toString() }),
      ...(options?.file_type && { file_type: options.file_type }),
      ...(options?.search && { search: options.search }),
      ...(options?.visibility && { visibility: options.visibility }),
    });
    
    const res = await fetch(`${API_BASE_URL}/artifacts?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    if (!res.ok) throw new Error('Failed to fetch artifacts');
    const data = await res.json();
  
    return {
      artifacts: data.artifacts || data || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10
    };
  },

  // Backward compatibility method
  async getArtifactsLegacy(workspaceId: string, ownerId: string): Promise<Artifact[]> {
    const result = await this.getArtifacts(workspaceId, ownerId);
    return result.artifacts;
  },

  async updateArtifact(id: string, body: Partial<Artifact>): Promise<Artifact> {
    const token = localStorage.getItem("token");
    const res = await fetch(API_ENDPOINTS.artifact.update(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update artifact');
    const data = await res.json();
    return data.data;
  },

  async deleteArtifact(id: string): Promise<{ success: boolean }> {
    const token = localStorage.getItem("token");
    const res = await fetch(API_ENDPOINTS.artifact.delete(id), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to delete artifact');
    return { success: true };
  },

  async shareArtifact(id: string, body: { shared_with: string[]; can_edit: boolean; visibility: 'public' | 'private' }): Promise<{ success: boolean }> {
    const token = localStorage.getItem("token");
    const res = await fetch(API_ENDPOINTS.artifact.share(id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to share artifact');
    return { success: true };
  },

  async transferOwner(id: string, new_owner_id: string): Promise<{ success: boolean }> {
    const token = localStorage.getItem("token");
    const res = await fetch(API_ENDPOINTS.artifact.transferOwner(id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ new_owner_id }),
    });
    if (!res.ok) throw new Error('Failed to transfer owner');
    return { success: true };
  },

  async importToKnowledgeBase(id: string): Promise<any> {
    const token = localStorage.getItem("token");
    const res = await fetch(API_ENDPOINTS.artifact.importToKnowledgeBase(id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to import artifact to knowledge base');
    return res.json();
  },

  async convertToRAG(id: string): Promise<{ success: boolean }> {
    const token = localStorage.getItem("token");
    const res = await fetch(API_ENDPOINTS.artifact.convertToRAG(id), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to convert artifact to RAG');
    return { success: true };
  },

  async getArtifactById(id: string): Promise<Artifact> {
    const token = localStorage.getItem("token");
    const res = await fetch(API_ENDPOINTS.artifact.getById(id), {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to fetch artifact');
    const data = await res.json();
    return data.data;
  },

  async createArtifact(body: Partial<Artifact>): Promise<Artifact> {
    const token = localStorage.getItem("token");
    const res = await fetch(API_ENDPOINTS.artifact.create, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to create artifact');
    const data = await res.json();
    return data.data;
  },

  async uploadArtifactFile(threadId: string, files: File[], message_content = '', optimistic_id = '', token?: string): Promise<any> {
    const formData = new FormData();
    if (message_content) formData.append('message_content', message_content);
    files.forEach((file) => formData.append('files', file));
    if (optimistic_id) formData.append('optimistic_id', optimistic_id);
    const res = await fetch(API_ENDPOINTS.artifact.upload(threadId), {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload artifact file');
    return res.json();
  },
};
