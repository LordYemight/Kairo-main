import { create } from 'zustand';

export interface CalendarStore {
  // State
  currentDate: Date;
  selectedDate: Date | null;
  viewMode: 'month' | 'week' | 'day';
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  
  // Navigation
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  
  // Utility functions
  getCalendarDays: () => Array<{
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    tasks: any[];
  }>;
  
  getTasksForDate: (date: Date, allTasks: any[]) => any[];
  getMonthName: () => string;
  getYear: () => number;
  
  // Task calendar integration
  getTaskDatesInMonth: (tasks: any[]) => Set<string>;
  getDaysWithTasks: (tasks: any[]) => Set<string>;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  selectedDate: null,
  viewMode: 'month',

  // Basic setters
  setCurrentDate: (date) => set({ currentDate: new Date(date) }),
  setSelectedDate: (date) => set({ selectedDate: date ? new Date(date) : null }),
  setViewMode: (mode) => set({ viewMode: mode }),

  // Navigation actions
  goToPreviousMonth: () => {
    const { currentDate } = get();
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    set({ currentDate: newDate });
  },

  goToNextMonth: () => {
    const { currentDate } = get();
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    set({ currentDate: newDate });
  },

  goToPreviousWeek: () => {
    const { currentDate } = get();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    set({ currentDate: newDate });
  },

  goToNextWeek: () => {
    const { currentDate } = get();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    set({ currentDate: newDate });
  },

  goToPreviousDay: () => {
    const { currentDate } = get();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    set({ currentDate: newDate });
  },

  goToNextDay: () => {
    const { currentDate } = get();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    set({ currentDate: newDate });
  },

  goToToday: () => {
    set({ currentDate: new Date() });
  },

  // Calendar calculation functions
  getCalendarDays: () => {
    const { currentDate, selectedDate } = get();
    const today = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add previous month's trailing days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
        tasks: []
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
        tasks: []
      });
    }
    
    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
        tasks: []
      });
    }
    
    return days;
  },

  getTasksForDate: (date, allTasks) => {
    const dateString = date.toISOString().split('T')[0];
    return allTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateString;
    });
  },

  getMonthName: () => {
    const { currentDate } = get();
    return currentDate.toLocaleString('default', { month: 'long' });
  },

  getYear: () => {
    const { currentDate } = get();
    return currentDate.getFullYear();
  },

  getTaskDatesInMonth: (tasks) => {
    const { currentDate } = get();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const taskDates = new Set<string>();
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate);
        if (taskDate >= monthStart && taskDate <= monthEnd) {
          taskDates.add(taskDate.toISOString().split('T')[0]);
        }
      }
    });
    
    return taskDates;
  },

  getDaysWithTasks: (tasks) => {
    const taskDates = new Set<string>();
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate);
        taskDates.add(taskDate.toISOString().split('T')[0]);
      }
      if (task.startDate) {
        const startDate = new Date(task.startDate);
        taskDates.add(startDate.toISOString().split('T')[0]);
      }
    });
    
    return taskDates;
  }
}));