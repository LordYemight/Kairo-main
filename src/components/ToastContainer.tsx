'use client';

import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ToastContainerProps {
  toasts: Toast[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getToastClasses = (type: string) => {
    const baseClasses = "p-4 rounded-lg shadow-lg text-white flex items-center gap-3 notification";
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-500`;
      case 'error':
        return `${baseClasses} bg-red-500`;
      default:
        return `${baseClasses} bg-blue-500`;
    }
  };

  return (
    <div id="toast-container" className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastClasses(toast.type)}
        >
          {getToastIcon(toast.type)}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}