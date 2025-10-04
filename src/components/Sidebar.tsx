'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  User, 
  Clock, 
  Trello, 
  Calendar, 
  BarChart3, 
  Info 
} from 'lucide-react';
import { themes } from '../lib/constants';

interface SidebarProps {
  appState: any;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'client', label: 'Client Tasks', icon: Briefcase },
  { id: 'personal', label: 'Personal Tasks', icon: User },
  { id: 'due-soon', label: 'Task Due & Soon', icon: Clock },
  { id: 'kairo', label: 'Kairo Board', icon: Trello },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'about', label: 'About Kairo', icon: Info },
];

export default function Sidebar({ appState }: SidebarProps) {
  const {
    currentPage,
    setPage,
    settings,
    clientTasks,
    personalTasks,
    isMobileSidebarOpen,
    closeMobileSidebar
  } = appState;

  const totalTasks = clientTasks.length + personalTasks.length;
  const completedTasks = [...clientTasks, ...personalTasks].filter((t: any) => t.status === 'Completed').length;
  const overdueTasks = [...clientTasks, ...personalTasks].filter((t: any) => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
  ).length;

  const currentTheme = themes[settings.theme as keyof typeof themes];
  const sidebarClasses = `w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen transition-all duration-300 ${
    settings.sidebarCollapsed ? 'sidebar-collapsed' : ''
  } ${
    isMobileSidebarOpen ? 'mobile-open' : ''
  } mobile-sidebar`;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}
      
      <nav className={sidebarClasses}>
        <div className="p-4">
          {/* Navigation Buttons */}
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? `bg-gradient-to-r ${currentTheme} text-white font-medium`
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="sidebar-text">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="quick-stats mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 sidebar-text">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center sidebar-text">
                <span className="text-sm text-gray-600">Total Tasks</span>
                <span className="text-sm font-semibold text-gray-900" id="stat-total">
                  {totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center sidebar-text">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-semibold text-green-600" id="stat-completed">
                  {completedTasks}
                </span>
              </div>
              <div className="flex justify-between items-center sidebar-text">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="text-sm font-semibold text-red-600" id="stat-overdue">
                  {overdueTasks}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}