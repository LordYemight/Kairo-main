'use client';

import React from 'react';
import { Briefcase, User } from 'lucide-react';

interface TaskTypeSelectorProps {
  isOpen: boolean;
  appState: any;
}

export default function TaskTypeSelector({ isOpen, appState }: TaskTypeSelectorProps) {
  if (!isOpen) return null;

  const handleTypeSelect = (type: 'client' | 'personal') => {
    appState.openTaskModal(type);
    appState.closeAllPanels();
  };

  return (
    <div className={`task-type-selector ${!isOpen ? 'hidden' : ''}`}>
      <div
        className="task-type-option"
        onClick={() => handleTypeSelect('client')}
      >
        <Briefcase className="w-5 h-5 text-blue-600" />
        <span className="font-medium">Client Task</span>
      </div>
      <div
        className="task-type-option"
        onClick={() => handleTypeSelect('personal')}
      >
        <User className="w-5 h-5 text-green-600" />
        <span className="font-medium">Personal Task</span>
      </div>
    </div>
  );
}