'use client';

import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  appState: any;
}

export default function SettingsModal({ isOpen, appState }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Settings</h3>
          <button
            onClick={() => appState.setIsSettingsModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">Settings modal - Coming soon!</p>
        </div>
      </div>
    </div>
  );
}