import React, { useEffect, useState } from 'react';
import { useWorkflowStatus } from '@/hooks/useWorkflowStatus';
import { Loader2, CheckCircle, AlertCircle, X, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStatusProps {
  conversationId: string | null;
  className?: string;
  showConnectionStatus?: boolean;
  autoHideDelay?: number;
}

export function WorkflowStatus({ 
  conversationId, 
  className,
  showConnectionStatus = false,
  autoHideDelay = 5000
}: WorkflowStatusProps) {
  const { 
    latestStatus, 
    isConnected, 
    connectionError,
    isWorkflowActive 
  } = useWorkflowStatus(conversationId);
  
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAutoHide, setShouldAutoHide] = useState(false);

  useEffect(() => {
    if (latestStatus) {
      setIsVisible(true);
      setShouldAutoHide(false);

      // Auto-hide completed/error statuses after delay
      if (latestStatus.status === 'completed' || latestStatus.status === 'error') {
        setShouldAutoHide(true);
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [latestStatus, autoHideDelay]);

  // Don't render if no status or not visible
  if (!isVisible || !latestStatus) {
    // Show connection status if requested and not connected
    if (showConnectionStatus && !isConnected && conversationId) {
      return (
        <div className={cn(
          "fixed bottom-20 right-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-lg p-3 max-w-sm",
          className
        )}>
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">Connecting to status server...</span>
          </div>
        </div>
      );
    }
    return null;
  }

  const getStatusIcon = () => {
    switch (latestStatus.status) {
      case 'started':
      case 'processing':
      case 'analyzing':
      case 'api-call':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (latestStatus.status) {
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 rounded-lg shadow-lg p-4 max-w-sm transition-all duration-300 border",
        "animate-in slide-in-from-right fade-in",
        shouldAutoHide && "animate-out slide-out-to-right fade-out",
        getStatusColor(),
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {latestStatus.message}
          </p>
          
          {latestStatus.progress !== undefined && latestStatus.progress < 100 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{latestStatus.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${latestStatus.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {latestStatus.metadata && Object.keys(latestStatus.metadata).length > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {Object.entries(latestStatus.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {!isWorkflowActive && (
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {showConnectionStatus && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-500" />
                <span className="text-red-600 dark:text-red-400">
                  {connectionError || 'Disconnected'}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}