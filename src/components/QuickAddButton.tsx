'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface QuickAddButtonProps {
  appState: any;
}

export default function QuickAddButton({ appState }: QuickAddButtonProps) {
  return (
    <button
      onClick={appState.toggleTaskTypeSelector}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-40"
      title="Add new task"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}