'use client';

import React from 'react';

interface NotificationsPanelProps {
  isOpen: boolean;
  appState: any;
}

export default function NotificationsPanel({ isOpen, appState }: NotificationsPanelProps) {
  if (!isOpen) return null;

  const { notifications } = appState;

  return (
    <div className="fixed top-16 right-4 w-80 bg-white shadow-xl rounded-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold">Notifications</h3>
        <button
          onClick={appState.closeAllPanels}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications</p>
        ) : (
          <div className="space-y-2 p-4">
            {notifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg notification-item notification-${notification.type}`}
              >
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}