'use client';

import React, { useEffect } from 'react';
import { Task, Message } from '../lib/types';
import { useTasks } from './hooks/useTasks';
import { initEmailJS, sendRegistrationEmail } from '../lib/email';
import { themes } from '../lib/constants';
import FirstTimeModal from '../components/modals/FirstTimeModal';
import TaskModal from '../components/modals/TaskModal';
import SettingsModal from '../components/modals/SettingsModal';
import InboxModal from '../components/modals/InboxModal';
import Dashboard from '../components/pages/Dashboard';

export default function HomePage() {
  const {
    clientTasks,
    personalTasks,
    settings,
    setSettings,
    notifications,
    messages,
    setMessages,
    currentPage,
    setCurrentPage,
    editingTask,
    setEditingTask,
    taskType,
    setTaskType,
    tags,
    setTags,
    selectedCalendarDate,
    setSelectedCalendarDate,
    isFirstTimeUser,
    setIsFirstTimeUser,
    showFirstTimeModal,
    setShowFirstTimeModal,
    showTaskModal,
    setShowTaskModal,
    showSettingsModal,
    setShowSettingsModal,
    showInboxModal,
    setShowInboxModal,
    showTaskTypeSelector,
    setShowTaskTypeSelector,
    showNotificationsPanel,
    setShowNotificationsPanel,
    showToast,
    markAllNotificationsAsRead,
    clearNotifications,
    addTask,
    updateTask,
    deleteTask,
    sendWelcomeMessage
  } = useTasks();

  // Initialize EmailJS and handle dark mode
  useEffect(() => {
    initEmailJS();
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode'); 
    }
  }, [settings.darkMode]);

  // Initialize Lucide icons after render
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      setTimeout(() => (window as any).lucide.createIcons(), 100);
    }
  });

  // Handle first time user modal submission
  const handleFirstTimeSubmit = (userData: { 
    fullName: string; 
    gender: string; 
    email: string; 
    whatsapp: string; 
  }) => {
    // Send registration email
    sendRegistrationEmail(userData.fullName, userData.gender, userData.email, userData.whatsapp);
    
    // Update settings
    setSettings(prev => ({ ...prev, userName: userData.fullName }));
    
    // Mark as not first time user
    localStorage.setItem('firstTimeUser', 'false');
    setIsFirstTimeUser(false);
    setShowFirstTimeModal(false);
    
    // Send welcome message
    sendWelcomeMessage();
    
    // Show success toast
    showToast(`Welcome to Kairo, ${userData.fullName}!`, 'success');
  };

  // Handle welcome message (pass it to FirstTimeModal)
  const handleAddMessage = (message: Message) => {
    setMessages(prev => [message, ...prev]);
  };

  // Handle task modal
  const handleShowTaskModal = (type: 'client' | 'personal', task?: Task, dueDate?: string) => {
    setTaskType(type);
    setEditingTask(task || null);
    setTags(task?.tags || []);
    
    if (dueDate && !task) {
      setSelectedCalendarDate(new Date(dueDate));
    }
    
    setShowTaskModal(true);
  };

  const handleTaskSave = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setShowTaskModal(false);
    setEditingTask(null);
    setSelectedCalendarDate(null);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setSelectedCalendarDate(null);
    setTags([]);
  };

  // Handle settings modal
  const handleSettingsSave = (newSettings: typeof settings) => {
    setSettings(newSettings);
    showToast('Settings saved successfully!', 'success');
  };

  // Handle inbox actions
  const handleMarkMessageAsRead = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const handleMarkAllMessagesAsRead = () => {
    setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
    showToast('All messages marked as read', 'success');
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    showToast('Message deleted', 'success');
  };

  const handleClearAllMessages = () => {
    setMessages([]);
    showToast('All messages cleared', 'success');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    setSettings(prev => ({ ...prev, darkMode: newDarkMode }));
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      showToast('Dark mode enabled', 'success');
    } else {
      document.body.classList.remove('dark-mode');
      showToast('Dark mode disabled', 'success');
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Mobile: toggle mobile-open class
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.toggle('mobile-open');
      }
    } else {
      // Desktop: toggle collapsed state
      const newCollapsed = !settings.sidebarCollapsed;
      setSettings(prev => ({ ...prev, sidebarCollapsed: newCollapsed }));
      
      const sidebar = document.getElementById('sidebar');
      const mainContent = document.getElementById('main-content');
      
      if (sidebar && mainContent) {
        if (newCollapsed) {
          sidebar.classList.add('sidebar-collapsed');
          mainContent.classList.add('ml-2');
        } else {
          sidebar.classList.remove('sidebar-collapsed');
          mainContent.classList.remove('ml-2');
        }
      }
    }
  };

  // Get stats for display
  const totalTasks = clientTasks.length + personalTasks.length;
  const completedTasks = [...clientTasks, ...personalTasks].filter(t => t.status === 'Completed').length;
  const overdueTasks = [...clientTasks, ...personalTasks].filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
  ).length;
  const unreadMessages = messages.filter(m => !m.read).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Get theme classes
  const themeClass = themes[settings.theme as keyof typeof themes] || themes.blue;

  // Render content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard clientTasks={clientTasks} personalTasks={personalTasks} />;
      case 'client':
        return renderClientTasks();
      case 'personal':
        return renderPersonalTasks();
      case 'about':
        return renderAboutPage();
      default:
        return <Dashboard clientTasks={clientTasks} personalTasks={personalTasks} />;
    }
  };

  const renderClientTasks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-col md:flex-row gap-4 md:gap-0">
        <h2 className="text-2xl font-bold text-gray-900">Client Tasks</h2>
        <button 
          onClick={() => handleShowTaskModal('client')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white bg-gradient-to-r ${themeClass} hover:opacity-90 transition-opacity font-medium`}
        >
          <i data-lucide="plus" className="w-5 h-5"></i>
          Add Client Task
        </button>
      </div>

      {clientTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i data-lucide="briefcase" className="w-16 h-16 mx-auto"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Client Tasks Yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first client task.</p>
          <button
            onClick={() => handleShowTaskModal('client')}
            className={`bg-gradient-to-r ${themeClass} text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity`}
          >
            Add First Client Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientTasks.map(task => (
            <div key={task.id} className="task-card bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  {task.clientName && <p className="text-sm text-gray-600 font-medium">{task.clientName}</p>}
                  <h4 className="font-semibold text-gray-900">{task.projectName}</h4>
                  {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleShowTaskModal('client', task)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <i data-lucide="edit-3" className="w-4 h-4"></i>
                  </button>
                  <button
                    onClick={() => deleteTask(task.id, 'client')}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <i data-lucide="trash-2" className="w-4 h-4"></i>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map(tag => (
                      <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                    task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPersonalTasks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-col md:flex-row gap-4 md:gap-0">
        <h2 className="text-2xl font-bold text-gray-900">Personal Tasks</h2>
        <button 
          onClick={() => handleShowTaskModal('personal')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-green-600 to-green-800 hover:opacity-90 transition-opacity font-medium"
        >
          <i data-lucide="plus" className="w-5 h-5"></i>
          Add Personal Task
        </button>
      </div>

      {personalTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i data-lucide="user" className="w-16 h-16 mx-auto"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Personal Tasks Yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first personal task.</p>
          <button
            onClick={() => handleShowTaskModal('personal')}
            className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Add First Personal Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalTasks.map(task => (
            <div key={task.id} className="task-card bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{task.projectName}</h4>
                  {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                  {task.category && <p className="text-sm text-purple-600 font-medium mt-1">{task.category}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleShowTaskModal('personal', task)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <i data-lucide="edit-3" className="w-4 h-4"></i>
                  </button>
                  <button
                    onClick={() => deleteTask(task.id, 'personal')}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <i data-lucide="trash-2" className="w-4 h-4"></i>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map(tag => (
                      <span key={tag} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                    task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAboutPage = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About Kairo</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Kairo is a user-focused task management platform from Biznetic AI that helps individuals, 
          SMEs and large organisations manage work more efficiently.
        </p>
      </div>

      <div className="about-section">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
        <div className="space-y-3">
          <div className="contact-info">
            <span className="contact-icon">📱</span>
            <span>WhatsApp: +234 806 024 6920</span>
            <button 
              onClick={() => navigator.clipboard.writeText('+2348060246920')}
              className="copy-icon"
            >
              <i data-lucide="copy" className="w-4 h-4"></i>
            </button>
          </div>
          <div className="contact-info">
            <span className="contact-icon">📧</span>
            <span>Email: support@kairo.app</span>
          </div>
          <div className="contact-info">
            <span className="contact-icon">🌐</span>
            <span>Website: kairo.app</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="app">
      {/* First Time User Modal */}
      <FirstTimeModal
        isOpen={showFirstTimeModal}
        onSubmit={handleFirstTimeSubmit}
        onAddMessage={handleAddMessage}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={handleCloseTaskModal}
        onSave={handleTaskSave}
        taskType={taskType}
        editingTask={editingTask}
        tags={tags}
        setTags={setTags}
        selectedCalendarDate={selectedCalendarDate}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />

      {/* Inbox Modal */}
      <InboxModal
        isOpen={showInboxModal}
        onClose={() => setShowInboxModal(false)}
        messages={messages}
        onMarkAsRead={handleMarkMessageAsRead}
        onMarkAllAsRead={handleMarkAllMessagesAsRead}
        onDeleteMessage={handleDeleteMessage}
        onClearAll={handleClearAllMessages}
      />

      {/* Header */}
      {!isFirstTimeUser && (
        <header id="header" className={`bg-gradient-to-r ${themeClass} text-white p-4 shadow-lg`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              >
                <i data-lucide="menu" className="w-5 h-5"></i>
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
                onClick={() => setShowInboxModal(true)}
                className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors relative"
              >
                <i data-lucide="mail" className="w-5 h-5"></i>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              >
                <i data-lucide={settings.darkMode ? 'sun' : 'moon'} className="w-5 h-5"></i>
              </button>
              <button 
                onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
                className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors relative"
              >
                <i data-lucide="bell" className="w-5 h-5"></i>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              >
                <i data-lucide="settings" className="w-5 h-5"></i>
              </button>
            </div>
          </div>
        </header>
      )}

      {!isFirstTimeUser && (
        <div className="flex max-w-7xl mx-auto" id="main-app">
          {/* Sidebar */}
          <nav id="sidebar" className={`w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen transition-all duration-300 mobile-sidebar ${settings.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="p-4">
              <div className="space-y-2">
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'dashboard' 
                      ? `bg-gradient-to-r ${themeClass} text-white font-medium`
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <i data-lucide="home" className="w-5 h-5"></i>
                  <span className="sidebar-text">Dashboard</span>
                </button>
                <button 
                  onClick={() => setCurrentPage('client')}
                  className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'client' 
                      ? `bg-gradient-to-r ${themeClass} text-white font-medium`
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <i data-lucide="briefcase" className="w-5 h-5"></i>
                  <span className="sidebar-text">Client Tasks</span>
                </button>
                <button 
                  onClick={() => setCurrentPage('personal')}
                  className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'personal' 
                      ? `bg-gradient-to-r ${themeClass} text-white font-medium`
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <i data-lucide="user" className="w-5 h-5"></i>
                  <span className="sidebar-text">Personal Tasks</span>
                </button>
                <button 
                  onClick={() => setCurrentPage('about')}
                  className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'about'
                      ? `bg-gradient-to-r ${themeClass} text-white font-medium`
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <i data-lucide="info" className="w-5 h-5"></i>
                  <span className="sidebar-text">About Kairo</span>
                </button>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg quick-stats">
                <h3 className="font-semibold text-gray-700 mb-2 sidebar-text">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="sidebar-text">Total Tasks:</span>
                    <span className="font-medium">{totalTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="sidebar-text">Completed:</span>
                    <span className="font-medium text-green-600">{completedTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="sidebar-text">Overdue:</span>
                    <span className="font-medium text-red-600">{overdueTasks}</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main id="main-content" className={`flex-1 p-6 transition-all duration-300 ${settings.sidebarCollapsed ? 'ml-2' : ''}`}>
            {renderContent()}
          </main>
        </div>
      )}

      {/* Task Type Selector */}
      {showTaskTypeSelector && (
        <div className="task-type-selector">
          <div 
            className="task-type-option" 
            onClick={() => {
              handleShowTaskModal('client');
              setShowTaskTypeSelector(false);
            }}
          >
            <i data-lucide="briefcase" className="w-5 h-5 text-blue-600"></i>
            <span>Client Task</span>
          </div>
          <div 
            className="task-type-option"
            onClick={() => {
              handleShowTaskModal('personal');
              setShowTaskTypeSelector(false);
            }}
          >
            <i data-lucide="user" className="w-5 h-5 text-green-600"></i>
            <span>Personal Task</span>
          </div>
        </div>
      )}

      {/* Floating Quick Add Button */}
      {!isFirstTimeUser && (
        <button 
          id="quick-add-button"
          onClick={() => setShowTaskTypeSelector(!showTaskTypeSelector)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-40"
        >
          <i data-lucide="plus" className="w-6 h-6"></i>
        </button>
      )}

      {/* Notifications Panel */}
      {showNotificationsPanel && (
        <div className="fixed top-16 right-4 w-80 bg-white shadow-xl rounded-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex gap-2">
              <button
                onClick={markAllNotificationsAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
              <button
                onClick={clearNotifications}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowNotificationsPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i data-lucide="x" className="w-4 h-4"></i>
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 notification-item notification-${notification.type} ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.date).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications Container */}
      <div id="toast-container" className="fixed bottom-4 right-4 space-y-2 z-50"></div>
    </div>
  );
}