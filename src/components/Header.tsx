'use client';

import React, { useEffect } from 'react';
import { Moon, Sun, Bell, Mail, Settings, Menu } from 'lucide-react';
import { themes } from '../lib/constants';

interface HeaderProps {
  appState: any; // Will be properly typed later
}

export default function Header({ appState }: HeaderProps) {
  const {
    settings,
    toggleDarkMode,
    toggleSidebar,
    toggleNotificationsPanel,
    setIsInboxModalOpen,
    setIsSettingsModalOpen,
    notifications,
    messages,
    toggleMobileSidebar
  } = appState;

  const unreadNotificationCount = notifications.filter((n: any) => !n.read).length;
  const unreadMessageCount = messages.filter((m: any) => !m.read).length;

  const currentTheme = themes[settings.theme as keyof typeof themes];

  return (
    <header className={`bg-gradient-to-r ${currentTheme} text-white p-4 shadow-lg`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors hidden md:block"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {settings.logo && (
            <img
              src={settings.logo}
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          
          <div>
            <h1 className="text-xl font-bold">Kairo</h1>
            <p className="text-sm opacity-90">Welcome back, {settings.userName}!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInboxModalOpen(true)}
            className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors relative"
            title="Messages"
          >
            <Mail className="w-5 h-5" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {unreadMessageCount}
              </span>
            )}
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            title={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={toggleNotificationsPanel}
            className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {unreadNotificationCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}