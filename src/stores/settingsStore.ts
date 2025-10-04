import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Settings } from '../lib/types';

export interface SettingsStore {
  // State
  settings: Settings;
  isFirstTimeUser: boolean;

  // Actions
  updateSettings: (newSettings: Partial<Settings>) => void;
  setUserName: (userName: string) => void;
  setLogo: (logoUrl: string | null) => void;
  setTheme: (theme: string) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  updateNotificationSettings: (notifications: Partial<Settings['notifications']>) => void;
  setFirstTimeUser: (isFirst: boolean) => void;
  
  // Getters
  getCurrentTheme: () => string;
  isDarkMode: () => boolean;
  isSidebarCollapsed: () => boolean;
  getNotificationSettings: () => Settings['notifications'];
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

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      isFirstTimeUser: typeof window !== 'undefined' ? localStorage.getItem('firstTimeUser') === null : true,

      // Actions
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setUserName: (userName) => {
        set(state => ({
          settings: { ...state.settings, userName }
        }));
      },

      setLogo: (logoUrl) => {
        set(state => ({
          settings: { ...state.settings, logo: logoUrl }
        }));
      },

      setTheme: (theme) => {
        set(state => ({
          settings: { ...state.settings, theme }
        }));
      },

      toggleDarkMode: () => {
        set(state => ({
          settings: { 
            ...state.settings, 
            darkMode: !state.settings.darkMode 
          }
        }));

        // Apply dark mode to document body
        const { settings } = get();
        if (typeof document !== 'undefined') {
          if (settings.darkMode) {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
        }
      },

      toggleSidebar: () => {
        set(state => ({
          settings: { 
            ...state.settings, 
            sidebarCollapsed: !state.settings.sidebarCollapsed 
          }
        }));
      },

      updateNotificationSettings: (notifications) => {
        set(state => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...notifications }
          }
        }));
      },

      setFirstTimeUser: (isFirst) => {
        set({ isFirstTimeUser: isFirst });
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('firstTimeUser', isFirst ? 'true' : 'false');
        }
      },

      // Getters
      getCurrentTheme: () => get().settings.theme,
      isDarkMode: () => get().settings.darkMode,
      isSidebarCollapsed: () => get().settings.sidebarCollapsed,
      getNotificationSettings: () => get().settings.notifications,
    }),
    {
      name: 'kairo-settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings
      }),
      onRehydrateStorage: () => (state) => {
        // Apply dark mode on rehydration
        if (state?.settings.darkMode && typeof document !== 'undefined') {
          document.body.classList.add('dark-mode');
        }
      }
    }
  )
);