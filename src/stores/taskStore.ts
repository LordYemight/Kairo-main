import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task } from '../lib/types';
import { 
  parseAmount, 
  formatAmount, 
  calculatePaymentProgress, 
  calculateDaysBetween, 
  updateTaskPriorityBasedOnDueDate 
} from '../lib/utils';

export interface TaskStore {
  // State
  clientTasks: Task[];
  personalTasks: Task[];
  taskTemplates: Task[];
  editingTask: Task | null;
  taskType: 'client' | 'personal';
  tags: string[];

  // Actions
  setClientTasks: (tasks: Task[]) => void;
  setPersonalTasks: (tasks: Task[]) => void;
  setEditingTask: (task: Task | null) => void;
  setTaskType: (type: 'client' | 'personal') => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  // Task CRUD operations
  addTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: number, taskData: Partial<Task>) => void;
  deleteTask: (taskId: number, type: 'client' | 'personal') => void;
  completeTask: (taskId: number, type: 'client' | 'personal') => void;

  // Utility functions
  getAllTasks: () => Task[];
  getTasksByStatus: (status: string) => Task[];
  getOverdueTasks: () => Task[];
  getDueSoonTasks: () => Task[];
  urgencySort: (tasks: Task[]) => Task[];
  
  // Payment related
  updatePayment: (taskId: number, amountPaid: string, type: 'client' | 'personal') => void;
  
  // Statistics
  getTaskStats: () => {
    total: number;
    completed: number;
    overdue: number;
    inProgress: number;
    notStarted: number;
  };
  
  getFinancialOverview: (type: 'client' | 'personal') => {
    totalRevenue: number;
    totalPaid: number;
    totalOutstanding: number;
  };
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial state
      clientTasks: [],
      personalTasks: [],
      taskTemplates: [],
      editingTask: null,
      taskType: 'client',
      tags: [],

      // Setters
      setClientTasks: (tasks) => set({ clientTasks: tasks }),
      setPersonalTasks: (tasks) => set({ personalTasks: tasks }),
      setEditingTask: (task) => set({ editingTask: task }),
      setTaskType: (type) => set({ taskType: type }),
      setTags: (tags) => set({ tags }),
      
      addTag: (tag) => {
        const { tags } = get();
        if (!tags.includes(tag.trim()) && tag.trim()) {
          set({ tags: [...tags, tag.trim()] });
        }
      },
      
      removeTag: (tag) => {
        const { tags } = get();
        set({ tags: tags.filter(t => t !== tag) });
      },

      // Task CRUD operations
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now() + Math.random(),
          createdAt: new Date().toISOString(),
        };

        // Update priority based on due date
        newTask.priority = updateTaskPriorityBasedOnDueDate(newTask);

        // Calculate days if start and due dates are provided
        if (taskData.startDate && taskData.dueDate) {
          const daysData = calculateDaysBetween(newTask);
          if (daysData) {
            (newTask as any).days = daysData;
          }
        }

        // Handle payment calculations
        if (taskData.totalAmount) {
          const totalAmount = parseAmount(taskData.totalAmount);
          const amountPaid = parseAmount(taskData.amountPaid || '');
          const outstanding = Math.max(0, totalAmount.value - amountPaid.value);
          
          newTask.outstandingAmount = formatAmount(totalAmount.currency, outstanding);
          newTask.paymentProgress = calculatePaymentProgress(totalAmount, amountPaid);
          newTask.currency = totalAmount.currency;
        }

        const { taskType } = get();
        if (taskType === 'client') {
          set(state => ({ clientTasks: [...state.clientTasks, newTask] }));
        } else {
          set(state => ({ personalTasks: [...state.personalTasks, newTask] }));
        }
      },

      updateTask: (taskId, taskData) => {
        const { clientTasks, personalTasks } = get();
        
        const updateTaskInArray = (tasks: Task[]) => 
          tasks.map(task => {
            if (task.id === taskId) {
              const updatedTask = { ...task, ...taskData };
              
              // Update priority based on due date
              updatedTask.priority = updateTaskPriorityBasedOnDueDate(updatedTask);
              
              // Recalculate days if dates changed
              if (updatedTask.startDate && updatedTask.dueDate) {
                const daysData = calculateDaysBetween(updatedTask);
                if (daysData) {
                  (updatedTask as any).days = daysData;
                }
              }

              // Handle payment updates
              if (updatedTask.totalAmount) {
                const totalAmount = parseAmount(updatedTask.totalAmount);
                const amountPaid = parseAmount(updatedTask.amountPaid || '');
                const outstanding = Math.max(0, totalAmount.value - amountPaid.value);
                
                updatedTask.outstandingAmount = formatAmount(totalAmount.currency, outstanding);
                updatedTask.paymentProgress = calculatePaymentProgress(totalAmount, amountPaid);
              }

              // Handle completion
              if (updatedTask.status === 'Completed' && !task.completedAt) {
                updatedTask.completedAt = new Date().toISOString();
              } else if (updatedTask.status !== 'Completed' && task.completedAt) {
                updatedTask.completedAt = null;
              }

              return updatedTask;
            }
            return task;
          });

        // Check if task exists in client tasks
        if (clientTasks.find(t => t.id === taskId)) {
          set({ clientTasks: updateTaskInArray(clientTasks) });
        } else {
          set({ personalTasks: updateTaskInArray(personalTasks) });
        }
      },

      deleteTask: (taskId, type) => {
        if (type === 'client') {
          set(state => ({ 
            clientTasks: state.clientTasks.filter(task => task.id !== taskId)
          }));
        } else {
          set(state => ({ 
            personalTasks: state.personalTasks.filter(task => task.id !== taskId)
          }));
        }
      },

      completeTask: (taskId, type) => {
        get().updateTask(taskId, { 
          status: 'Completed',
          completedAt: new Date().toISOString()
        });
      },

      // Utility functions
      getAllTasks: () => {
        const { clientTasks, personalTasks } = get();
        return [...clientTasks, ...personalTasks];
      },

      getTasksByStatus: (status) => {
        return get().getAllTasks().filter(task => task.status === status);
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().getAllTasks().filter(task => 
          task.dueDate && 
          new Date(task.dueDate) < now && 
          task.status !== 'Completed'
        );
      },

      getDueSoonTasks: () => {
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
        
        return get().getAllTasks().filter(task => 
          task.dueDate && 
          new Date(task.dueDate) <= threeDaysFromNow && 
          new Date(task.dueDate) >= now &&
          task.status !== 'Completed'
        );
      },

      urgencySort: (tasks) => {
        const now = new Date();
        return [...tasks].sort((a, b) => {
          const aDue = a.dueDate ? new Date(a.dueDate) : null;
          const bDue = b.dueDate ? new Date(b.dueDate) : null;
          
          const aOverdue = aDue && aDue < now && a.status !== 'Completed';
          const bOverdue = bDue && bDue < now && b.status !== 'Completed';

          // Overdue tasks first
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          if (aOverdue && bOverdue) return aDue!.getTime() - bDue!.getTime();

          // Then due soon tasks
          if (aDue && bDue) {
            const aDiff = Math.ceil((aDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const bDiff = Math.ceil((bDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            const aSoon = aDiff >= 0 && aDiff <= 3;
            const bSoon = bDiff >= 0 && bDiff <= 3;
            
            if (aSoon && !bSoon) return -1;
            if (!aSoon && bSoon) return 1;
            if (aSoon && bSoon) return aDiff - bDiff;
          }

          // Then by due date
          if (aDue && bDue) {
            const timeDiff = aDue.getTime() - bDue.getTime();
            if (timeDiff !== 0) return timeDiff;
          }

          // Finally by creation date (newest first)
          return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
        });
      },

      updatePayment: (taskId, amountPaid, type) => {
        const tasks = type === 'client' ? get().clientTasks : get().personalTasks;
        const task = tasks.find(t => t.id === taskId);
        
        if (task && task.totalAmount) {
          const totalAmount = parseAmount(task.totalAmount);
          const paidAmount = parseAmount(amountPaid);
          const outstanding = Math.max(0, totalAmount.value - paidAmount.value);
          
          get().updateTask(taskId, {
            amountPaid,
            outstandingAmount: formatAmount(totalAmount.currency, outstanding),
            paymentProgress: calculatePaymentProgress(totalAmount, paidAmount)
          });
        }
      },

      getTaskStats: () => {
        const allTasks = get().getAllTasks();
        return {
          total: allTasks.length,
          completed: allTasks.filter(t => t.status === 'Completed').length,
          overdue: get().getOverdueTasks().length,
          inProgress: allTasks.filter(t => 
            t.status !== 'Completed' && t.status !== 'Not Started'
          ).length,
          notStarted: allTasks.filter(t => t.status === 'Not Started').length
        };
      },

      getFinancialOverview: (type) => {
        const tasks = type === 'client' ? get().clientTasks : get().personalTasks;
        const tasksWithPayment = tasks.filter(t => t.totalAmount);

        const totalRevenue = tasksWithPayment.reduce((sum, task) => {
          const amount = parseAmount(task.totalAmount || '');
          return sum + amount.value;
        }, 0);

        const totalPaid = tasksWithPayment.reduce((sum, task) => {
          const totalAmount = parseAmount(task.totalAmount || '');
          const outstandingAmount = parseAmount(task.outstandingAmount || '0');
          return sum + (totalAmount.value - outstandingAmount.value);
        }, 0);

        const totalOutstanding = totalRevenue - totalPaid;

        return { totalRevenue, totalPaid, totalOutstanding };
      }
    }),
    {
      name: 'kairo-tasks-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clientTasks: state.clientTasks,
        personalTasks: state.personalTasks,
        taskTemplates: state.taskTemplates
      })
    }
  )
);