'use client';

import React, { useEffect, useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { initEmailJS } from '../lib/email';
import { save } from '../lib/storage';
import { Message } from '../lib/types';
import FirstTimeModal from '../components/modals/FirstTimeModal';
import TaskModal from '../components/modals/TaskModal';
import Dashboard from '../components/pages/Dashboard';
import ClientTasksPage from '../components/pages/ClientTasksPage';
import PersonalTasksPage from '../components/pages/PersonalTasksPage';
import DueSoonPage from '../components/pages/DueSoonPage';

export default function HomePage() {
  const appState = useAppState();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    initEmailJS();
    if (appState.settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [appState.settings.darkMode]);

  useEffect(() => {
    setIsFirstTimeUser(localStorage.getItem('firstTimeUser') === null);
  }, []);

  const handleFirstTimeSetup = (data: { fullName: string; gender: string; email: string; whatsapp: string }) => {
    appState.updateSettings({ 
      userName: data.fullName
    });
    
    localStorage.setItem('firstTimeUser', 'false');
    setIsFirstTimeUser(false);
    
    // Add welcome message
    const welcomeText = `Welcome to Kairo, ${data.fullName}! 🎉\n\nWe're excited to have you on board. Kairo is designed to help you manage your tasks efficiently.\n\nHere are some quick tips:\n• Use the "+" button to add new tasks\n• Click on any task to edit it\n• Use the calendar to set due dates\n• Track your progress with our analytics\n\nGet started by adding your first task!\n\nBest regards,\nThe Kairo Team`;
    const newMessage: Message = { 
      id: Date.now(), 
      from: 'Maayo', 
      subject: 'Welcome to Kairo!', 
      body: welcomeText, 
      date: new Date().toISOString(), 
      read: false 
    };
    
    const currentMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    const updatedMessages = [newMessage, ...currentMessages];
    save('messages', updatedMessages);
  };

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'dashboard':
        return <Dashboard appState={appState} />;
      case 'client':
        return <ClientTasksPage appState={appState} />;
      case 'personal':
        return <PersonalTasksPage appState={appState} />;
      case 'due-soon':
        return <DueSoonPage appState={appState} />;
      default:
        return <Dashboard appState={appState} />;
    }
  };

  return (
    <div id="app" className="flex h-screen bg-gray-50">
      {/* First Time Modal */}
      {isFirstTimeUser && (
        <FirstTimeModal
          isOpen={isFirstTimeUser}
          onSubmit={handleFirstTimeSetup}
        />
      )}

      {/* Task Modal */}
      {appState.isTaskModalOpen && (
        <TaskModal
          isOpen={appState.isTaskModalOpen}
          onClose={() => appState.closeTaskModal()}
          taskType={appState.taskType}
          editingTask={appState.editingTask}
          tags={appState.tags}
          setTags={appState.setTags}
          selectedCalendarDate={appState.selectedCalendarDate ? new Date(appState.selectedCalendarDate) : null}
          onSave={(taskData) => {
            if (appState.editingTask) {
              // Handle update task when we implement task management
              console.log('Update task:', appState.editingTask.id, taskData);
            } else {
              // Handle add task when we implement task management
              console.log('Add task:', taskData);
            }
            appState.closeTaskModal();
          }}
        />
      )}

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              id="user-logo" 
              src={appState.settings.logo || ''} 
              alt="Logo" 
              className={`w-10 h-10 rounded-full object-cover ${appState.settings.logo ? '' : 'hidden'}`} 
            />
            <div>
              <h1 className="text-xl font-bold">Kairo</h1>
              <p className="text-sm opacity-90">Welcome back, {appState.settings.userName}!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => appState.updateSettings({ darkMode: !appState.settings.darkMode })}
              className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              🌙
            </button>
          </div>
        </header>
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg mt-20 h-[calc(100vh-80px)] overflow-y-auto">
        <nav className="p-4">
          <div className="space-y-2">
            <button 
              onClick={() => appState.setPage('dashboard')} 
              className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                appState.currentPage === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => appState.setPage('client')} 
              className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                appState.currentPage === 'client' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏢 Client Tasks
            </button>
            <button 
              onClick={() => appState.setPage('personal')} 
              className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                appState.currentPage === 'personal' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              👤 Personal Tasks
            </button>
            <button 
              onClick={() => appState.setPage('due-soon')} 
              className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                appState.currentPage === 'due-soon' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              ⏰ Due Soon
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mt-20 p-6 overflow-y-auto">
        {renderCurrentPage()}
      </main>

      {/* Quick Add Button */}
      <button
        onClick={() => appState.openTaskModal()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
      >
        ➕
      </button>
    </div>
  );
}