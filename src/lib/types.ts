export interface Task {
  id: number;
  clientName?: string;
  projectName: string;
  description?: string;
  files?: string;
  tags?: string[];
  startDate?: string;
  dueDate?: string;
  status: string;
  priority: string;
  totalAmount?: string;
  outstandingAmount?: string;
  paymentProgress?: number;
  currency?: string;
  progress?: number;
  createdAt?: string;
  completedAt?: string | null;
  category?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info'|'success'|'warning'|'error';
  date: string;
  read: boolean;
}

export interface Message {
  id: number;
  from: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

export interface Settings {
  userName: string;
  logo?: string | null;
  theme: string;
  darkMode: boolean;
  sidebarCollapsed: boolean;
  notifications: {
    overdue: boolean;
    upcoming: boolean;
    updates: boolean;
    payments: boolean;
  };
}
