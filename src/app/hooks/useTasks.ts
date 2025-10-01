import { useState, useEffect } from 'react';
import { Task, Settings, Notification, Message } from '@/lib/types';
import { useLocalStorage } from './useLocalStorage';

export function useTasks() {
  const [clientTasks, setClientTasks] = useLocalStorage<Task[]>('clientTasks', []);
  const [personalTasks, setPersonalTasks] = useLocalStorage<Task[]>('personalTasks', []);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    userName: 'Your Name',
    logo: null,
    theme: 'blue',
    darkMode: false,
    sidebarCollapsed: false,
    notifications: {
      overdue: true,
      upcoming: true,
      updates: true,
      payments: true
    }
  });
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);
  const [messages, setMessages] = useLocalStorage<Message[]>('messages', []);
  const [taskTemplates] = useState<unknown[]>([]); // Not used in original, but keeping for parity

  // Additional state from HTML
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskType, setTaskType] = useState<'client' | 'personal'>('client');
  const [tags, setTags] = useState<string[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(true);

  // Initialize isFirstTimeUser
  useEffect(() => {
    const firstTime = localStorage.getItem('firstTimeUser') === null;
    setIsFirstTimeUser(firstTime);
  }, []);

  const saveData = () => {
    // Data is automatically saved via useLocalStorage
  };

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newNotification: Notification = {
      id: Date.now(),
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    // This would be implemented with a toast system
    console.log(`Toast: ${type} - ${message}`);
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    if (taskType === 'client') {
      setClientTasks(prev => [...prev, newTask]);
    } else {
      setPersonalTasks(prev => [...prev, newTask]);
    }

    showToast(`Task "${task.projectName}" added successfully`, 'success');
  };

  const updateTask = (taskId: number, updates: Partial<Task>) => {
    const updateTasks = (tasks: Task[]) =>
      tasks.map(task => task.id === taskId ? { ...task, ...updates } : task);

    if (taskType === 'client') {
      setClientTasks(updateTasks);
    } else {
      setPersonalTasks(updateTasks);
    }

    showToast(`Task updated successfully`, 'success');
  };

  const deleteTask = (taskId: number, type: 'client' | 'personal') => {
    if (type === 'client') {
      setClientTasks(prev => prev.filter(task => task.id !== taskId));
    } else {
      setPersonalTasks(prev => prev.filter(task => task.id !== taskId));
    }

    showToast('Task deleted successfully', 'success');
  };

  return {
    clientTasks,
    setClientTasks,
    personalTasks,
    setPersonalTasks,
    settings,
    setSettings,
    notifications,
    setNotifications,
    messages,
    setMessages,
    taskTemplates,
    currentPage,
    setCurrentPage,
    editingTask,
    setEditingTask,
    taskType,
    setTaskType,
    tags,
    setTags,
    calendarDate,
    setCalendarDate,
    selectedCalendarDate,
    setSelectedCalendarDate,
    isFirstTimeUser,
    setIsFirstTimeUser,
    saveData,
    addNotification,
    showToast,
    addTask,
    updateTask,
    deleteTask
  };
}