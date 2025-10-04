import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]">
        <div className="rounded-lg border bg-background p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'rounded-full p-3',
                variant === 'danger' && 'bg-destructive/10 text-destructive',
                variant === 'warning' && 'bg-yellow-500/10 text-yellow-600',
                variant === 'info' && 'bg-primary/10 text-primary'
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md',
                    'bg-secondary text-secondary-foreground',
                    'hover:bg-secondary/80',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md',
                    variant === 'danger' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                    variant === 'warning' && 'bg-yellow-500 text-white hover:bg-yellow-600',
                    variant === 'info' && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className={cn(
                'rounded-md p-1',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}