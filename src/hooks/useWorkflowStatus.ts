import { useState, useEffect, useCallback, useRef } from 'react';

export interface WorkflowStatus {
  type: 'connected' | 'status' | 'error';
  status?: string;
  message?: string;
  progress?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface UseWorkflowStatusOptions {
  maxStatusHistory?: number;
  reconnectDelay?: number;
  debug?: boolean;
}

export function useWorkflowStatus(
  conversationId: string | null,
  options: UseWorkflowStatusOptions = {}
) {
  const {
    maxStatusHistory = 50,
    reconnectDelay = 5000,
    debug = false
  } = options;

  const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);

  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[WebSocket ${conversationId}]`, message, ...args);
    }
  }, [conversationId, debug]);

  const connect = useCallback(() => {
    if (!conversationId) {
      log('No conversationId provided, skipping connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log('Already connected, skipping');
      return;
    }

    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:3001'}?conversationId=${conversationId}`;
    log('Connecting to:', wsUrl);
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        log('Connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const status: WorkflowStatus = JSON.parse(event.data);
          log('Received status:', status);
          
          setStatuses(prev => {
            const newStatuses = [...prev, status];
            // Keep only the last N statuses
            if (newStatuses.length > maxStatusHistory) {
              return newStatuses.slice(-maxStatusHistory);
            }
            return newStatuses;
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        log('Connection error:', error);
        setConnectionError('Failed to connect to status server');
      };
      
      wsRef.current.onclose = (event) => {
        log('Connection closed:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;
        
        // Reconnect with exponential backoff
        if (conversationId) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000 // Max 30 seconds
          );
          
          log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
    }
  }, [conversationId, reconnectDelay, maxStatusHistory, log]);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        log('Closing connection');
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  const clearStatuses = useCallback(() => {
    setStatuses([]);
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
    }
  }, []);

  // Get latest status that's not a connection status
  const latestStatus = statuses
    .filter(s => s.type === 'status')
    .slice(-1)[0] || null;

  // Check if workflow is currently active
  const isWorkflowActive = latestStatus && 
    latestStatus.status !== 'completed' && 
    latestStatus.status !== 'error';

  return {
    statuses,
    latestStatus,
    isConnected,
    connectionError,
    isWorkflowActive,
    clearStatuses,
    disconnect
  };
}