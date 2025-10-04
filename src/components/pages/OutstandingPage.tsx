'use client';

import React from 'react';

export default function OutstandingPage({ appState }: { appState: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Outstanding</h2>
      <p className="text-gray-600">Outstanding amounts - Coming soon!</p>
    </div>
  );
}