'use client';

import React from 'react';

export default function CompletedPage({ appState }: { appState: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Completed</h2>
      <p className="text-gray-600">Completed tasks - Coming soon!</p>
    </div>
  );
}