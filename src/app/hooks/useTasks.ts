import { useState, useEffect, useCallback } from 'react';
import { Task, Settings, Notification, Message } from '@/lib/types';
import { useLocalStorage } from './useLocalStorage';

// Toast system for notifications
type ToastType = 'info' | 'success' | 'warning' | 'error';

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
  const [sortClientTasksByDueDate, setSortClientTasksByDueDate] = useState<boolean>(false);

  // Modal states
  const [showFirstTimeModal, setShowFirstTimeModal] = useState<boolean>(false);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showInboxModal, setShowInboxModal] = useState<boolean>(false);
  const [showTaskTypeSelector, setShowTaskTypeSelector] = useState<boolean>(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState<boolean>(false);

  // Initialize isFirstTimeUser
  useEffect(() => {
    const firstTime = localStorage.getItem('firstTimeUser') === null;
    setIsFirstTimeUser(firstTime);
    setShowFirstTimeModal(firstTime);
  }, []);

  const saveData = () => {
    // Data is automatically saved via useLocalStorage
  };

  // Toast system implementation
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-lg shadow-lg text-white flex items-center ${
      type === 'success' ? 'bg-green-500' :
      type === 'warning' ? 'bg-yellow-500' :
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } notification`;

    const iconName = type === 'success' ? 'check-circle' : 
                    type === 'warning' ? 'alert-triangle' : 
                    type === 'error' ? 'x-circle' : 'info';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="w-5 h-5 mr-2"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    
    // Initialize lucide icons for the new toast
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }

    setTimeout(() => toast.remove(), 3000);
  }, []);

  const addNotification = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const newNotification: Notification = {
      id: Date.now(),
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, [setNotifications]);

  const markNotificationAsRead = useCallback((notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, [setNotifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  }, [setNotifications, showToast]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    showToast('All notifications cleared', 'success');
  }, [setNotifications, showToast]);

  // Task priority update based on due date
  const updateTaskPriorityBasedOnDueDate = useCallback((task: Task): string => {
    if (task.status === 'Completed') return task.priority;
    if (!task.dueDate) return task.priority;
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Urgent';
    else if (diffDays === 0) return 'Urgent';
    else if (diffDays <= 2) return 'High';
    return task.priority;
  }, []);

  // Urgency sort function
  const urgencySort = useCallback((tasks: Task[]): Task[] => {
    const now = new Date();
    return [...tasks].sort((a, b) => {
      // Completed tasks go to bottom
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (b.status === 'Completed' && a.status !== 'Completed') return -1;
      
      // Priority order
      const priorityOrder: { [key: string]: number } = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const aPriority = priorityOrder[updateTaskPriorityBasedOnDueDate(a)] || 0;
      const bPriority = priorityOrder[updateTaskPriorityBasedOnDueDate(b)] || 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Due date comparison
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // Default by creation date
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
      return bCreated - aCreated;
    });
  }, [updateTaskPriorityBasedOnDueDate]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      priority: updateTaskPriorityBasedOnDueDate(task as Task)
    };

    if (taskType === 'client') {
      setClientTasks(prev => [...prev, newTask]);
    } else {
      setPersonalTasks(prev => [...prev, newTask]);
    }

    addNotification('Task Added', `Task "${task.projectName}" has been added`, 'success');
    showToast(`Task "${task.projectName}" added successfully`, 'success');
  }, [taskType, setClientTasks, setPersonalTasks, updateTaskPriorityBasedOnDueDate, addNotification, showToast]);

  const updateTask = useCallback((taskId: number, updates: Partial<Task>) => {
    const updateTasks = (tasks: Task[]) =>
      tasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates };
          updatedTask.priority = updateTaskPriorityBasedOnDueDate(updatedTask);
          return updatedTask;
        }
        return task;
      });

    const taskName = editingTask?.projectName || 'Task';
    
    if (taskType === 'client') {
      setClientTasks(updateTasks);
    } else {
      setPersonalTasks(updateTasks);
    }

    addNotification('Task Updated', `Task "${taskName}" has been updated`, 'info');
    showToast(`Task "${taskName}" updated successfully`, 'success');
  }, [taskType, setClientTasks, setPersonalTasks, updateTaskPriorityBasedOnDueDate, editingTask, addNotification, showToast]);

  const deleteTask = useCallback((taskId: number, type: 'client' | 'personal') => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    let taskName = 'Task';
    
    if (type === 'client') {
      const task = clientTasks.find(t => t.id === taskId);
      taskName = task?.projectName || 'Task';
      setClientTasks(prev => prev.filter(task => task.id !== taskId));
    } else {
      const task = personalTasks.find(t => t.id === taskId);
      taskName = task?.projectName || 'Task';
      setPersonalTasks(prev => prev.filter(task => task.id !== taskId));
    }

    addNotification('Task Deleted', `Task "${taskName}" has been deleted`, 'warning');
    showToast('Task deleted successfully', 'success');
  }, [clientTasks, personalTasks, setClientTasks, setPersonalTasks, addNotification, showToast]);

  // Check for notifications - runs periodically to check overdue/upcoming tasks
  const checkForNotifications = useCallback(() => {
    if (!settings.notifications.overdue && !settings.notifications.upcoming) return;

    const allTasks = [...clientTasks, ...personalTasks];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    allTasks.forEach(task => {
      if (task.status === 'Completed' || !task.dueDate) return;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check if we already have a notification for this task
      const existingNotification = notifications.find(n => 
        n.message.includes(task.projectName) && 
        (n.title.includes('Overdue') || n.title.includes('Due Soon'))
      );
      
      if (existingNotification) return;

      if (diffDays < 0 && settings.notifications.overdue) {
        addNotification(
          'Task Overdue',
          `Task "${task.projectName}" is overdue by ${Math.abs(diffDays)} day(s)`,
          'error'
        );
      } else if (diffDays >= 0 && diffDays <= 3 && settings.notifications.upcoming) {
        addNotification(
          'Task Due Soon',
          `Task "${task.projectName}" is due ${diffDays === 0 ? 'today' : `in ${diffDays} day(s)`}`,
          'warning'
        );
      }
    });
  }, [clientTasks, personalTasks, settings.notifications, notifications, addNotification]);

  // Run notification check on task changes
  useEffect(() => {
    checkForNotifications();
  }, [clientTasks, personalTasks, checkForNotifications]);

  // Welcome message for first time users
  const sendWelcomeMessage = useCallback(() => {
    const firstName = settings.userName.split(' ')[0];
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

    const newMessage: Message = {
      id: Date.now(),
      from: 'Maayo',
      subject: 'Welcome to Kairo!',
      body: welcomeText,
      date: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [newMessage, ...prev]);
    localStorage.setItem('welcomeMessageSent', 'true');
  }, [settings.userName, setMessages]);

  // Financial calculations
  const calculateClientFinancialOverview = useCallback(() => {
    const clientTasksWithPayment = clientTasks.filter(t => t.totalAmount);
    
    const parseAmount = (amountStr: string): number => {
      if (!amountStr) return 0;
      const valueMatch = amountStr.match(/[\d\.]+/);
      return valueMatch ? parseFloat(valueMatch[0]) : 0;
    };

    const totalRevenue = clientTasksWithPayment.reduce((sum, task) => {
      return sum + parseAmount(task.totalAmount || '');
    }, 0);

    const totalPaid = clientTasksWithPayment.reduce((sum, task) => {
      const totalAmount = parseAmount(task.totalAmount || '');
      const outstandingAmount = parseAmount(task.outstandingAmount || '');
      return sum + (totalAmount - outstandingAmount);
    }, 0);

    const totalOutstanding = totalRevenue - totalPaid;

    return { totalRevenue, totalPaid, totalOutstanding };
  }, [clientTasks]);

  const calculatePersonalFinancialOverview = useCallback(() => {
    const personalTasksWithPayment = personalTasks.filter(t => t.totalAmount);
    
    const parseAmount = (amountStr: string): number => {
      if (!amountStr) return 0;
      const valueMatch = amountStr.match(/[\d\.]+/);
      return valueMatch ? parseFloat(valueMatch[0]) : 0;
    };

    const totalAmount = personalTasksWithPayment.reduce((sum, task) => {
      return sum + parseAmount(task.totalAmount || '');
    }, 0);

    const totalPaid = personalTasksWithPayment.reduce((sum, task) => {
      const totalAmount = parseAmount(task.totalAmount || '');
      const outstandingAmount = parseAmount(task.outstandingAmount || '');
      return sum + (totalAmount - outstandingAmount);
    }, 0);

    const totalOutstanding = totalAmount - totalPaid;

    return { totalAmount, totalPaid, totalOutstanding };
  }, [personalTasks]);

  return {
    // State
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
    sortClientTasksByDueDate,
    setSortClientTasksByDueDate,
    
    // Modal states
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
    
    // Functions
    saveData,
    showToast,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    updateTaskPriorityBasedOnDueDate,
    urgencySort,
    addTask,
    updateTask,
    deleteTask,
    checkForNotifications,
    sendWelcomeMessage,
    calculateClientFinancialOverview,
    calculatePersonalFinancialOverview
  };
}