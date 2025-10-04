import { create } from 'zustand';

export type PageType = 'dashboard' | 'client' | 'personal' | 'due-soon' | 'kairo' | 'calendar' | 'analytics' | 'about';

export interface UIStore {
  // State
  currentPage: PageType;
  isTaskModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isInboxModalOpen: boolean;
  isFirstTimeModalOpen: boolean;
  isNotificationsPanelOpen: boolean;
  isTaskTypeSelectorOpen: boolean;
  isMobileSidebarOpen: boolean;
  isFocusMode: boolean;
  selectedCalendarDate: string | null;
  
  // Toast state
  toasts: Array<{
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
  }>;

  // Actions
  setCurrentPage: (page: PageType) => void;
  openTaskModal: () => void;
  closeTaskModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openInboxModal: () => void;
  closeInboxModal: () => void;
  openFirstTimeModal: () => void;
  closeFirstTimeModal: () => void;
  toggleNotificationsPanel: () => void;
  closeNotificationsPanel: () => void;
  openTaskTypeSelector: () => void;
  closeTaskTypeSelector: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setSelectedCalendarDate: (date: string | null) => void;
  
  // Focus mode
  enterFocusMode: () => void;
  exitFocusMode: () => void;
  toggleFocusMode: () => void;
  
  // Toast management
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  removeToast: (id: number) => void;
  clearAllToasts: () => void;

  // Utility actions
  closeAllModals: () => void;
  closeAllPanels: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  currentPage: 'dashboard',
  isTaskModalOpen: false,
  isSettingsModalOpen: false,
  isInboxModalOpen: false,
  isFirstTimeModalOpen: false,
  isNotificationsPanelOpen: false,
  isTaskTypeSelectorOpen: false,
  isMobileSidebarOpen: false,
  isFocusMode: false,
  selectedCalendarDate: null,
  toasts: [],

  // Page navigation
  setCurrentPage: (page) => {
    set({ currentPage: page });
    // Close mobile sidebar when navigating
    get().closeMobileSidebar();
  },

  // Modal controls
  openTaskModal: () => set({ isTaskModalOpen: true }),
  closeTaskModal: () => set({ isTaskModalOpen: false }),
  
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  
  openInboxModal: () => set({ isInboxModalOpen: true }),
  closeInboxModal: () => set({ isInboxModalOpen: false }),
  
  openFirstTimeModal: () => set({ isFirstTimeModalOpen: true }),
  closeFirstTimeModal: () => set({ isFirstTimeModalOpen: false }),

  // Panel controls
  toggleNotificationsPanel: () => {
    set(state => ({ 
      isNotificationsPanelOpen: !state.isNotificationsPanelOpen 
    }));
  },
  closeNotificationsPanel: () => set({ isNotificationsPanelOpen: false }),

  // Task type selector
  openTaskTypeSelector: () => set({ isTaskTypeSelectorOpen: true }),
  closeTaskTypeSelector: () => set({ isTaskTypeSelectorOpen: false }),

  // Mobile sidebar
  toggleMobileSidebar: () => {
    set(state => ({ 
      isMobileSidebarOpen: !state.isMobileSidebarOpen 
    }));
  },
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),

  // Calendar
  setSelectedCalendarDate: (date) => set({ selectedCalendarDate: date }),

  // Focus mode
  enterFocusMode: () => {
    set({ isFocusMode: true });
    if (typeof document !== 'undefined') {
      document.body.classList.add('focus-mode-active');
    }
  },
  
  exitFocusMode: () => {
    set({ isFocusMode: false });
    if (typeof document !== 'undefined') {
      document.body.classList.remove('focus-mode-active');
    }
  },
  
  toggleFocusMode: () => {
    const { isFocusMode } = get();
    if (isFocusMode) {
      get().exitFocusMode();
    } else {
      get().enterFocusMode();
    }
  },

  // Toast management
  showToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    set(state => ({
      toasts: [...state.toasts, newToast]
    }));

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  
  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },
  
  clearAllToasts: () => set({ toasts: [] }),

  // Utility actions
  closeAllModals: () => {
    set({
      isTaskModalOpen: false,
      isSettingsModalOpen: false,
      isInboxModalOpen: false,
      isFirstTimeModalOpen: false
    });
  },
  
  closeAllPanels: () => {
    set({
      isNotificationsPanelOpen: false,
      isTaskTypeSelectorOpen: false,
      isMobileSidebarOpen: false
    });
  }
}));