import { useState, useEffect } from 'react';
import { aiService } from '../services/ai.service';
import { Agent as AIAgent, AgentsResponse } from '../types/ai.types';
import { useAuth } from './useAuth.jsx';

interface UseAIServiceAgentsReturn {
  data: AIAgent[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAIServiceAgents = (): UseAIServiceAgentsReturn => {
  const [data, setData] = useState<AIAgent[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAgents = async () => {
    if (!user?.id || !user?.name) {
      setError('User information not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Set current user for AI service
      aiService.setCurrentUser(user.id, user.name);
      
      console.log(' [useAIServiceAgents] Calling aiService.getAgents()...');
      
      // Fetch agents from AI service
      const response: AgentsResponse = await aiService.getAgents();
      
      console.log(' [useAIServiceAgents] Response received:', response);
      
      setData(response.agents || []);
    } catch (err) {
      console.error(' [useAIServiceAgents] Error fetching AI service agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch AI service agents');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [user?.id, user?.name]);

  const refetch = () => {
    fetchAgents();
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
};
