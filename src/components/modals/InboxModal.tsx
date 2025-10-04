'use client';

import React from 'react';

interface InboxModalProps {
  isOpen: boolean;
  appState: any;
}

export default function InboxModal({ isOpen, appState }: InboxModalProps) {
  if (!isOpen) return null;

  const { messages, setIsInboxModalOpen } = appState;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Inbox</h3>
          <button
            onClick={() => setIsInboxModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages yet</p>
          ) : (
            messages.map((message: any) => (
              <div key={message.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">{message.from}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(message.date).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-medium mb-2">{message.subject}</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{message.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}