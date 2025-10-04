import { Task } from './types';

export function parseAmount(amountStr: string) {
  if (!amountStr) return { currency: '₦', value: 0 };
  const currencyMatch = amountStr.match(/^[^\d\.]*/);
  const currency = currencyMatch ? currencyMatch[0] : '₦';
  const valueMatch = amountStr.match(/[\d\.]+/);
  const value = valueMatch ? parseFloat(valueMatch[0]) : 0;
  return { currency, value };
}

export function formatAmount(currency: string, value: number) {
  return `${currency}${value}`;
}

export function calculatePaymentProgress(totalAmount: {value:number}, amountPaid: {value:number}) {
  if (!totalAmount || totalAmount.value <= 0) return 0;
  return Math.min(100, Math.round((amountPaid.value / totalAmount.value) * 100));
}

export function calculateDaysBetween(task: Task) {
  if (!task.startDate || !task.dueDate) return null;
  const start = new Date(task.startDate);
  start.setHours(12,0,0,0);
  const due = new Date(task.dueDate);
  due.setHours(12,0,0,0);
  let referenceDate = new Date();
  if (task.status === 'Completed') {
    if (task.clientName) {
      const paymentProgress = task.paymentProgress || 0;
      if (paymentProgress === 100) {
        referenceDate = task.completedAt ? new Date(task.completedAt) : due;
        if (referenceDate > due) referenceDate = due;
      }
    } else {
      referenceDate = task.completedAt ? new Date(task.completedAt) : due;
      if (referenceDate > due) referenceDate = due;
    }
  }
  referenceDate.setHours(12,0,0,0);
  const diffTime = due.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000*60*60*24)) + 1;
  const remainingTime = due.getTime() - referenceDate.getTime();
  const remainingDays = Math.ceil(remainingTime / (1000*60*60*24));
  return { totalDays: diffDays, remainingDays };
}

export function updateTaskPriorityBasedOnDueDate(task: Task) {
  if (task.status === 'Completed') return task.priority;
  if (!task.dueDate) return task.priority;
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000*60*60*24));
  if (diffDays < 0) return 'Urgent';
  else if (diffDays === 0) return 'Urgent';
  else if (diffDays <= 2) return 'High';
  return task.priority;
}

export function getProgressFromStatus(status: string) {
  const progressMap: Record<string, number> = {
    'Not Started': 0,
    'Started': 20,
    'Processing': 40,
    'Review': 70,
    'Review Correction': 85,
    'Completed': 100
  };
  return progressMap[status] ?? 0;
}

// Sort tasks by urgency (overdue, due soon, then by due date)
export function urgencySort(tasks: Task[]): Task[] {
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
}

// Get color class for status
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'Not Started': 'bg-gray-100 text-gray-800',
    'Started': 'bg-blue-100 text-blue-800',
    'Processing': 'bg-yellow-100 text-yellow-800',
    'Review': 'bg-purple-100 text-purple-800',
    'Review Correction': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-green-100 text-green-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

// Get overdue tasks
export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date();
  return tasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) < now && 
    task.status !== 'Completed'
  );
}

// Get due soon tasks (next 3 days)
export function getDueSoonTasks(tasks: Task[]): Task[] {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
  
  return tasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) <= threeDaysFromNow && 
    new Date(task.dueDate) >= now &&
    task.status !== 'Completed'
  );
}

// Calculate financial overview for tasks
export function calculateFinancialOverview(tasks: Task[]): {
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
} {
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
