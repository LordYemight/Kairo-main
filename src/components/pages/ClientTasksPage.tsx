'use client';

import React from 'react';

interface ClientTasksPageProps {
  appState: any;
}

export default function ClientTasksPage({ appState }: ClientTasksPageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Client Tasks</h2>
      <p className="text-gray-600">Client tasks page - Coming soon!</p>
    </div>
  );
}