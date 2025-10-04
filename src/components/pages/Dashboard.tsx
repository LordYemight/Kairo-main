'use client';

import React from 'react';
import { Task } from '@/lib/types';

interface DashboardProps {
  appState: any;
}

export default function Dashboard({ appState }: DashboardProps) {
  const { clientTasks, personalTasks, openTaskModal } = appState;
  
  const totalTasks = clientTasks.length + personalTasks.length;
  const completedTasks = [...clientTasks, ...personalTasks].filter((t: Task) => t.status === 'Completed').length;
  const overdueTasks = [...clientTasks, ...personalTasks].filter((t: Task) =>
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
  ).length;
  const dueSoonTasks = [...clientTasks, ...personalTasks].filter((t: Task) =>
    t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && t.status !== 'Completed'
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i data-lucide="clipboard-list" className="w-6 h-6 text-blue-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i data-lucide="check-circle" className="w-6 h-6 text-green-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i data-lucide="alert-triangle" className="w-6 h-6 text-red-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Due Soon Tasks */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Due Soon</h3>
        {dueSoonTasks.length > 0 ? (
          <div className="space-y-3">
            {dueSoonTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.projectName}</p>
                  <p className="text-sm text-gray-600">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No tasks due soon</p>
        )}
      </div>
    </div>
  );
}