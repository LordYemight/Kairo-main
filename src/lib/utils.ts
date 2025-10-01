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
    'Processing': 50,
    'Review': 80,
    'Review Correction': 70,
    'Completed': 100
  };
  return progressMap[status] ?? 0;
}
