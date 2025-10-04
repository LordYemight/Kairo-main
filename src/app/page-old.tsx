'use client';

import React, { useEffect } from 'react';
import { Task, Message } from '../lib/types';
import { useTasks } from './hooks/useTasks';
import { initEmailJS, sendRegistrationEmail } from '../lib/email';
import FirstTimeModal from '../components/modals/FirstTimeModal';
import TaskModal from '../components/modals/TaskModal';

export default function HomePage() {
  const {
    clientTasks,
    personalTasks,
    settings,
    setSettings,
    messages,
    setMessages,
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
    showToast,
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

      {/* Toast Notifications Container */}
      <div id="toast-container" className="fixed bottom-4 right-4 space-y-2 z-50"></div>

      {/* Placeholder content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Kairo Task Management</h1>
        <p className="text-gray-600 mb-8">Your personal and client task management system.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
            <p className="text-3xl font-bold text-blue-600">{clientTasks.length + personalTasks.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Client Tasks</h3>
            <p className="text-3xl font-bold text-green-600">{clientTasks.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Personal Tasks</h3>
            <p className="text-3xl font-bold text-purple-600">{personalTasks.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => handleShowTaskModal('client')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i data-lucide="plus" className="w-5 h-5"></i>
            Add Client Task
          </button>
          
          <button
            onClick={() => handleShowTaskModal('personal')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <i data-lucide="plus" className="w-5 h-5"></i>
            Add Personal Task
          </button>
        </div>

        {/* Tasks Display */}
        {clientTasks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{task.projectName}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShowTaskModal('client', task)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <i data-lucide="edit" className="w-4 h-4"></i>
                      </button>
                      <button
                        onClick={() => deleteTask(task.id, 'client')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i data-lucide="trash-2" className="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.clientName}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'Started' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                      task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {personalTasks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Personal Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{task.projectName}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShowTaskModal('personal', task)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <i data-lucide="edit" className="w-4 h-4"></i>
                      </button>
                      <button
                        onClick={() => deleteTask(task.id, 'personal')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i data-lucide="trash-2" className="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.category}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'Started' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                      task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
    </div>
  );
}
                <label className="form-label"><span className="form-emoji">👤</span> Full Name</label>
                <input id="user-fullname" name="user-fullname" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your full name" required />
              </div>
              <div className="form-input-group">
                <label className="form-label"><span className="form-emoji">⚧️</span> Gender</label>
                <select id="user-gender" name="user-gender" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option value="">Select your gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className="form-input-group">
                <label className="form-label"><span className="form-emoji">📧</span> Gmail</label>
                <input id="user-email" name="user-email" type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your email address" required />
              </div>
              <div className="form-input-group">
                <label className="form-label"><span className="form-emoji">📱</span> WhatsApp Contact</label>
                <input id="user-whatsapp" name="user-whatsapp" type="tel" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your WhatsApp number" required />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">Submit & Continue</button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-4 text-center">By submitting this form, you agree to our terms of service and privacy policy.</p>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          taskType={taskType}
          editingTask={editingTask}
          onSave={(taskData) => {
            if (editingTask) {
              updateTask(editingTask.id, taskData);
            } else {
              addTask(taskData);
            }
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          tags={tags}
          setTags={setTags}
          selectedCalendarDate={selectedCalendarDate}
        />
      )}

      {/* Header */}
      <header id="header" className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg ${isFirstTimeUser ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button id="sidebar-toggle" className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors">
              <i data-lucide="menu" className="w-5 h-5"></i>
            </button>
            <img id="user-logo" src={settings.logo || ''} alt="Logo" className={`w-10 h-10 rounded-full object-cover ${settings.logo ? '' : 'hidden'}`} />
            <div>
              <h1 className="text-xl font-bold">Kairo</h1>
              <p id="welcome-text" className="text-sm opacity-90">Welcome back, {settings.userName}!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button id="inbox-button" className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors relative" title="Messages" onClick={() => {/* open inbox below */}}>
              <i data-lucide="mail" className="w-5 h-5"></i>
              <span id="inbox-count" className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">0</span>
            </button>
            <button id="dark-mode-toggle" className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors" onClick={() => setSettings(s => ({...s, darkMode: !s.darkMode}))}>
              <i data-lucide={settings.darkMode ? 'sun' : 'moon'} className="w-5 h-5"></i>
            </button>
            <button id="notifications-button" className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors relative">
              <i data-lucide="bell" className="w-5 h-5"></i>
              <span id="notification-count" className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">0</span>
            </button>
            <button id="settings-button" className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors">
              <i data-lucide="settings" className="w-5 h-5"></i>
            </button>
          </div>
        </div>
      </header>

      <div className={`flex max-w-7xl mx-auto ${isFirstTimeUser ? 'hidden' : ''}`} id="main-app">
        {/* Sidebar */}
        <nav id="sidebar" className={`w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen transition-all duration-300 mobile-sidebar`}> 
          <div className="p-4">
            <div className="space-y-2">
              <button data-page="dashboard" onClick={() => setCurrentPage('dashboard')} className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentPage==='dashboard' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}>
                <i data-lucide="home" className="w-5 h-5"></i>
                <span className="sidebar-text">Dashboard</span>
              </button>
              <button data-page="client" onClick={() => setCurrentPage('client')} className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentPage==='client' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}>
                <i data-lucide="briefcase" className="w-5 h-5"></i>
                <span className="sidebar-text">Client Tasks</span>
              </button>
              <button data-page="personal" onClick={() => setCurrentPage('personal')} className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentPage==='personal' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}>
                <i data-lucide="user" className="w-5 h-5"></i>
                <span className="sidebar-text">Personal Tasks</span>
              </button>
              <button data-page="due-soon" onClick={() => setCurrentPage('due-soon')} className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentPage==='due-soon' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}>
                <i data-lucide="clock" className="w-5 h-5"></i>
                <span className="sidebar-text">Task Due & Soon</span>
              </button>
              <button data-page="kairo" onClick={() => setCurrentPage('kairo')} className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentPage==='kairo' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}>
                <i data-lucide="layout" className="w-5 h-5"></i>
                <span className="sidebar-text">Kairo Board</span>
              </button>
              <button data-page="calendar" onClick={() => setCurrentPage('calendar')} className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentPage==='calendar' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}>
                <i data-lucide="calendar" className="w-5 h-5"></i>
                <span className="sidebar-text">Calendar</span>
              </button>
              <button data-page="analytics" onClick={() => setCurrentPage('analytics')} className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentPage==='analytics' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}>
                <i data-lucide="bar-chart" className="w-5 h-5"></i>
                <span className="sidebar-text">Analytics</span>
              </button>
              <button data-page="about" onClick={() => setCurrentPage('about')} className={`nav-button w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentPage==='about' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}>
                <i data-lucide="info" className="w-5 h-5"></i>
                <span className="sidebar-text">About Kairo</span>
              </button>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg quick-stats">
              <h3 className="font-semibold text-gray-700 mb-2 sidebar-text">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="sidebar-text">Total Tasks:</span>
                  <span id="stat-total" className="font-medium">{clientTasks.length + personalTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="sidebar-text">Completed:</span>
                  <span id="stat-completed" className="font-medium text-green-600">{[...clientTasks,...personalTasks].filter(t=>t.status==='Completed').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="sidebar-text">Overdue:</span>
                  <span id="stat-overdue" className="font-medium text-red-600">{[...clientTasks,...personalTasks].filter(t=>t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main id="main-content" className="flex-1 p-6 transition-all duration-300">
          {/* Simple page switcher rendering minimal content to match original's structure. Full rendering functions can be implemented similarly. */}
          {currentPage === 'dashboard' && (
            <Dashboard clientTasks={clientTasks} personalTasks={personalTasks} />
          )}
          {currentPage === 'client' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-col md:flex-row gap-4 md:gap-0">
                <h2 className="text-2xl font-bold text-gray-900">Client Tasks</h2>
                <button id="add-client-task" className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90 transition-opacity font-medium`} onClick={() => {
                  setTaskType('client');
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}>
                  <i data-lucide="plus" className="w-5 h-5"></i>
                  Add Client Task
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="tasks-container">
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
                          className="edit-task p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskType('client');
                            setEditingTask(task);
                            setShowTaskModal(true);
                          }}
                        >
                          <i data-lucide="edit-3" className="w-4 h-4"></i>
                        </button>
                        <button
                          className="delete-task p-1.5 text-red-600 hover:bg-red-50 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this task?')) {
                              deleteTask(task.id, 'client');
                            }
                          }}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {task.status}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{task.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentPage === 'personal' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-col md:flex-row gap-4 md:gap-0">
                <h2 className="text-2xl font-bold text-gray-900">Personal Tasks</h2>
                <button id="add-personal-task" className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-green-600 to-green-800 hover:opacity-90 transition-opacity font-medium`} onClick={() => {
                  setTaskType('personal');
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}>
                  <i data-lucide="plus" className="w-5 h-5"></i>
                  Add Personal Task
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="personal-tasks-container">
                {personalTasks.map(task => (
                  <div key={task.id} className="task-card bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{task.projectName}</h4>
                        {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          className="edit-task p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskType('personal');
                            setEditingTask(task);
                            setShowTaskModal(true);
                          }}
                        >
                          <i data-lucide="edit-3" className="w-4 h-4"></i>
                        </button>
                        <button
                          className="delete-task p-1.5 text-red-600 hover:bg-red-50 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this task?')) {
                              deleteTask(task.id, 'personal');
                            }
                          }}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {task.status}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{task.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentPage === 'about' && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">About Kairo</h1>
                <p className="text-gray-600 max-w-3xl mx-auto">Kairo is a user-focused task management platform from Biznetic AI that helps individuals, SMEs and large organisations manage work more efficiently.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating quick-add button (preserve original id/class) */}
      <button id="quick-add-button" className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-40" onClick={()=>{/* show type selector */}}>
        <i data-lucide="plus" className="w-6 h-6"></i>
      </button>

    </div>
  );
}
