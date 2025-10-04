'use client';

import React from 'react';

interface PersonalTasksPageProps {
  appState: any;
}

export default function PersonalTasksPage({ appState }: PersonalTasksPageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Personal Tasks</h2>
      <p className="text-gray-600">Personal tasks page - Coming soon!</p>
    </div>
  );
}