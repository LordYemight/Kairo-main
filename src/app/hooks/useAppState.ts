'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, Settings, Notification, Message } from '../../lib/types';
import { themes } from '../../lib/constants';
import { useLocalStorage } from './useLocalStorage';

export type PageType = 'dashboard' | 'client' | 'personal' | 'due-soon' | 'kairo' | 'calendar' | 'analytics' | 'about';

interface AppState {
  // Core data
  clientTasks: Task[];
  personalTasks: Task[];
  settings: Settings;
  notifications: Notification[];
  messages: Message[];
  
  // UI state
  currentPage: PageType;
  isFirstTimeUser: boolean;
  
  // Modal states
  isTaskModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isInboxModalOpen: boolean;
  isFirstTimeModalOpen: boolean;
  isNotificationsPanelOpen: boolean;
  isTaskTypeSelectorOpen: boolean;
  
  // Task state
  editingTask: Task | null;
  taskType: 'client' | 'personal';
  tags: string[];
  
  // Calendar state
  calendarDate: Date;
  selectedCalendarDate: string | null;
  
  // Mobile state
  isMobileSidebarOpen: boolean;
  
  // Toast state
  toasts: Array<{
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

const defaultSettings: Settings = {
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
};

export function useAppState() {
  // Persistent state
  const [clientTasks, setClientTasks] = useLocalStorage<Task[]>('clientTasks', []);
  const [personalTasks, setPersonalTasks] = useLocalStorage<Task[]>('personalTasks', []);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', defaultSettings);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);
  const [messages, setMessages] = useLocalStorage<Message[]>('messages', []);
  const [isFirstTimeUser, setIsFirstTimeUser] = useLocalStorage<boolean>('firstTimeUser', true);
  
  // Session state
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [isTaskTypeSelectorOpen, setIsTaskTypeSelectorOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskType, setTaskType] = useState<'client' | 'personal'>('client');
  const [tags, setTags] = useState<string[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [toasts, setToasts] = useState<AppState['toasts']>([]);

  // Initialize first time modal on mount
  useEffect(() => {
    if (isFirstTimeUser) {
      setIsFirstTimeModalOpen(true);
    }
  }, [isFirstTimeUser]);

  // Apply dark mode on settings change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (settings.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }, [settings.darkMode]);

  // Toast management
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  // Notification management
  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newNotification: Notification = {
      id: Date.now() + Math.random(),
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, [setNotifications]);

  // Message management
  const addMessage = useCallback((from: string, subject: string, body: string) => {
    const newMessage: Message = {
      id: Date.now() + Math.random(),
      from,
      subject,
      body,
      date: new Date().toISOString(),
      read: false
    };
    
    setMessages(prev => [newMessage, ...prev]);
  }, [setMessages]);

  // Modal controls
  const openTaskModal = useCallback((type?: 'client' | 'personal', task?: Task) => {
    if (type) setTaskType(type);
    if (task) {
      setEditingTask(task);
      setTags(task.tags || []);
    } else {
      setEditingTask(null);
      setTags([]);
    }
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTags([]);
    setSelectedCalendarDate(null);
  }, []);

  const toggleNotificationsPanel = useCallback(() => {
    setIsNotificationsPanelOpen(prev => !prev);
  }, []);

  const toggleTaskTypeSelector = useCallback(() => {
    setIsTaskTypeSelectorOpen(prev => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  // Settings updates
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !settings.darkMode;
    updateSettings({ darkMode: newDarkMode });
    showToast(`Dark mode ${newDarkMode ? 'enabled' : 'disabled'}`, 'success');
  }, [settings.darkMode, updateSettings, showToast]);

  const toggleSidebar = useCallback(() => {
    updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed });
  }, [settings.sidebarCollapsed, updateSettings]);

  // Close functions
  const closeAllModals = useCallback(() => {
    setIsTaskModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsInboxModalOpen(false);
    setIsFirstTimeModalOpen(false);
    setEditingTask(null);
    setTags([]);
  }, []);

  const closeAllPanels = useCallback(() => {
    setIsNotificationsPanelOpen(false);
    setIsTaskTypeSelectorOpen(false);
    setIsMobileSidebarOpen(false);
  }, []);

  // Navigation
  const setPage = useCallback((page: PageType) => {
    setCurrentPage(page);
    setIsMobileSidebarOpen(false);
  }, []);

  // First time user completion
  const completeFirstTimeSetup = useCallback((userData: {
    fullName: string;
    gender: string;
    email: string;
    whatsapp: string;
  }) => {
    updateSettings({ userName: userData.fullName });
    setIsFirstTimeUser(false);
    setIsFirstTimeModalOpen(false);
    
    // Add welcome message
    const firstName = userData.fullName.split(' ')[0];
    const welcomeText = `Hi ${firstName}, welcome to Kairo 👋

I'm Maayo, founder of Kairo — and I'm thrilled you're here.

Kairo was built to help busy people and teams take control of their day — not just at work, but in life. Whether you're managing client deadlines, household priorities, payments, or personal goals, Kairo brings everything into one calm place so you can think clearly and act with confidence.

WHY KAIRO MATTERS
• Clarity — See every commitment (client tasks + personal tasks) in one place so nothing slips through the cracks.
• Prioritization — Smart due-date and urgency helpers surface the right tasks so you tackle what matters now.
• Focus — Use Focus Mode when you need uninterrupted time to complete important work (try a 25-minute session).
• Organization across life & work — Keep client workflows and personal projects separate but visible together, protecting your time and energy.
• Payments & progress — Track fees, outstanding amounts and project progress so money and tasks stay aligned.
• Reflect & improve — Analytics and task history help you learn what works and get better each week.

HOW THIS HELPS YOU — PRACTICAL BENEFITS
• Spend less time deciding what to do next and more time doing it.  
• Reduce stress with reliable reminders and a single source of truth.  
• Improve delivery and client trust by tracking deadlines and payments.  
• Build better personal habits: plan workouts, bills, learning, or family time alongside work tasks.  
• Export, import, and back up your data anytime.

QUICK FIRST STEPS
1. Add your first task — click "+" or use **Add Client Task** / **Add Personal Task**.  
2. Connect or import — link your calendar or upload tasks to get started fast.  
3. Set notifications — choose reminders for overdue items, upcoming deadlines, and payments.  
4. Try Focus Mode — pick one in-progress task and start a 25-minute focus session.  
5. Explore Kairo Board & Calendar — drag tasks, set priorities, and view due dates visually.

NEED HELP OR FEEDBACK?
Reply to this message or go to **About → Contact**. I review early-user feedback personally — tell me what would make Kairo even more useful for you.

Welcome again — here's to calmer days, clearer priorities, and getting the right things done.

Warmly,  
Maayo  
Founder, Kairo`;

    addMessage('Maayo', 'Welcome to Kairo!', welcomeText);
    showToast(`Welcome to Kairo, ${userData.fullName}!`, 'success');
  }, [updateSettings, setIsFirstTimeUser, addMessage, showToast]);

  return {
    // State
    clientTasks,
    personalTasks,
    settings,
    notifications,
    messages,
    currentPage,
    isFirstTimeUser,
    isTaskModalOpen,
    isSettingsModalOpen,
    isInboxModalOpen,
    isFirstTimeModalOpen,
    isNotificationsPanelOpen,
    isTaskTypeSelectorOpen,
    isMobileSidebarOpen,
    editingTask,
    taskType,
    tags,
    calendarDate,
    selectedCalendarDate,
    toasts,

    // Setters
    setClientTasks,
    setPersonalTasks,
    setSettings,
    setNotifications,
    setMessages,
    setEditingTask,
    setTaskType,
    setTags,
    setCalendarDate,
    setSelectedCalendarDate,

    // Actions
    updateSettings,
    toggleDarkMode,
    toggleSidebar,
    showToast,
    addNotification,
    addMessage,
    openTaskModal,
    closeTaskModal,
    setPage,
    toggleNotificationsPanel,
    toggleTaskTypeSelector,
    toggleMobileSidebar,
    closeAllModals,
    closeAllPanels,
    completeFirstTimeSetup,

    // Modal state setters
    setIsTaskModalOpen,
    setIsSettingsModalOpen,
    setIsInboxModalOpen,
    setIsFirstTimeModalOpen,
    setIsNotificationsPanelOpen,
    setIsTaskTypeSelectorOpen,
    setIsMobileSidebarOpen,
  };
}