import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Notification, Message } from '../lib/types';

export interface NotificationStore {
  // State
  notifications: Notification[];
  messages: Message[];

  // Actions - Notifications
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: number) => void;
  clearAllNotifications: () => void;
  
  // Actions - Messages
  addMessage: (from: string, subject: string, body: string) => void;
  markMessageAsRead: (id: number) => void;
  markAllMessagesAsRead: () => void;
  deleteMessage: (id: number) => void;
  clearAllMessages: () => void;
  
  // Getters
  getUnreadNotificationCount: () => number;
  getUnreadMessageCount: () => number;
  getUnreadNotifications: () => Notification[];
  getUnreadMessages: () => Message[];
  getRecentNotifications: (limit?: number) => Notification[];
  getRecentMessages: (limit?: number) => Message[];
  
  // Utility
  checkForTaskNotifications: (tasks: any[]) => void;
  sendWelcomeMessage: (userName: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      messages: [],

      // Notification actions
      addNotification: (title, message, type) => {
        const newNotification: Notification = {
          id: Date.now() + Math.random(),
          title,
          message,
          type,
          date: new Date().toISOString(),
          read: false
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications]
        }));
      },

      markNotificationAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === id 
              ? { ...notification, read: true }
              : notification
          )
        }));
      },

      markAllNotificationsAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true
          }))
        }));
      },

      deleteNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(notification => 
            notification.id !== id
          )
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      // Message actions
      addMessage: (from, subject, body) => {
        const newMessage: Message = {
          id: Date.now() + Math.random(),
          from,
          subject,
          body,
          date: new Date().toISOString(),
          read: false
        };
        
        set(state => ({
          messages: [newMessage, ...state.messages]
        }));
      },

      markMessageAsRead: (id) => {
        set(state => ({
          messages: state.messages.map(message =>
            message.id === id 
              ? { ...message, read: true }
              : message
          )
        }));
      },

      markAllMessagesAsRead: () => {
        set(state => ({
          messages: state.messages.map(message => ({
            ...message,
            read: true
          }))
        }));
      },

      deleteMessage: (id) => {
        set(state => ({
          messages: state.messages.filter(message => message.id !== id)
        }));
      },

      clearAllMessages: () => {
        set({ messages: [] });
      },

      // Getters
      getUnreadNotificationCount: () => {
        return get().notifications.filter(n => !n.read).length;
      },

      getUnreadMessageCount: () => {
        return get().messages.filter(m => !m.read).length;
      },

      getUnreadNotifications: () => {
        return get().notifications.filter(n => !n.read);
      },

      getUnreadMessages: () => {
        return get().messages.filter(m => !m.read);
      },

      getRecentNotifications: (limit = 10) => {
        return get().notifications
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },

      getRecentMessages: (limit = 10) => {
        return get().messages
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },

      // Utility functions
      checkForTaskNotifications: (tasks) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        tasks.forEach(task => {
          if (task.dueDate && task.status !== 'Completed') {
            const dueDate = new Date(task.dueDate);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Check for overdue tasks
            if (diffDays < 0) {
              const existingOverdue = get().notifications.find(n => 
                n.title.includes('Overdue') && 
                n.message.includes(task.projectName) &&
                !n.read
              );
              
              if (!existingOverdue) {
                get().addNotification(
                  'Task Overdue',
                  `"${task.projectName}" is ${Math.abs(diffDays)} day(s) overdue`,
                  'error'
                );
              }
            }
            // Check for tasks due today
            else if (diffDays === 0) {
              const existingDueToday = get().notifications.find(n => 
                n.title.includes('Due Today') && 
                n.message.includes(task.projectName) &&
                !n.read
              );
              
              if (!existingDueToday) {
                get().addNotification(
                  'Task Due Today',
                  `"${task.projectName}" is due today`,
                  'warning'
                );
              }
            }
            // Check for tasks due tomorrow
            else if (diffDays === 1) {
              const existingDueTomorrow = get().notifications.find(n => 
                n.title.includes('Due Tomorrow') && 
                n.message.includes(task.projectName) &&
                !n.read
              );
              
              if (!existingDueTomorrow) {
                get().addNotification(
                  'Task Due Tomorrow',
                  `"${task.projectName}" is due tomorrow`,
                  'info'
                );
              }
            }
          }

          // Check for payment notifications
          if (task.totalAmount && task.outstandingAmount) {
            const outstanding = parseFloat(task.outstandingAmount.replace(/[^0-9.]/g, ''));
            if (outstanding > 0 && task.status === 'Completed') {
              const existingPayment = get().notifications.find(n => 
                n.title.includes('Payment Pending') && 
                n.message.includes(task.projectName) &&
                !n.read
              );
              
              if (!existingPayment) {
                get().addNotification(
                  'Payment Pending',
                  `"${task.projectName}" is completed but has outstanding payment of ${task.outstandingAmount}`,
                  'warning'
                );
              }
            }
          }
        });
      },

      sendWelcomeMessage: (userName) => {
        const firstName = userName.split(' ')[0];
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

        get().addMessage('Maayo', 'Welcome to Kairo!', welcomeText);
      }
    }),
    {
      name: 'kairo-notifications-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        messages: state.messages
      })
    }
  )
);