import React from 'react';
import { Task } from '../../lib/types';

interface DashboardProps {
  clientTasks: Task[];
  personalTasks: Task[];
}

export default function Dashboard({ clientTasks, personalTasks }: DashboardProps) {
  const totalTasks = clientTasks.length + personalTasks.length;
  const completedTasks = [...clientTasks, ...personalTasks].filter(t => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get recent tasks (last 5)
  const recentTasks = [...clientTasks, ...personalTasks]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Get urgent tasks
  const urgentTasks = [...clientTasks, ...personalTasks]
    .filter(task => task.priority === 'Urgent' && task.status !== 'Completed')
    .slice(0, 3);

  // Get overdue tasks
  const overdueTasks = [...clientTasks, ...personalTasks]
    .filter(task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed')
    .slice(0, 3);

  // Get due soon tasks (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const dueSoonTasks = [...clientTasks, ...personalTasks]
    .filter(task => {
      if (!task.dueDate || task.status === 'Completed') return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate >= today && dueDate <= nextWeek;
    })
    .slice(0, 3);

  // Financial overview for client tasks
  const totalEarnings = clientTasks.reduce((sum, task) => {
    const amount = typeof task.totalAmount === 'string' ? parseFloat(task.totalAmount) || 0 : task.totalAmount || 0;
    return sum + amount;
  }, 0);
  const totalPaid = clientTasks.reduce((sum, task) => {
    const amount = typeof task.amountPaid === 'string' ? parseFloat(task.amountPaid) || 0 : task.amountPaid || 0;
    return sum + amount;
  }, 0);
  const totalOutstanding = totalEarnings - totalPaid;
  const paymentProgress = totalEarnings > 0 ? Math.round((totalPaid / totalEarnings) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Get an overview of your tasks and progress</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <i data-lucide="list-checks" className="w-6 h-6 text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <i data-lucide="check-circle" className="w-6 h-6 text-green-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{pendingTasks}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <i data-lucide="clock" className="w-6 h-6 text-orange-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-3xl font-bold text-blue-600">{completedPercentage}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <i data-lucide="trending-up" className="w-6 h-6 text-blue-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      {clientTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-blue-600">₦{totalEarnings.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">₦{totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Payment Progress</span>
              <span className="text-sm text-gray-600">{paymentProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${paymentProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            <i data-lucide="clock" className="w-5 h-5 text-gray-400"></i>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <i data-lucide="list" className="w-12 h-12 text-gray-300 mx-auto mb-3"></i>
              <p className="text-gray-500">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.projectName}</h4>
                    <p className="text-sm text-gray-600">
                      {clientTasks.find(t => t.id === task.id) ? task.clientName : task.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                      task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Urgent Tasks</h3>
            <i data-lucide="alert-triangle" className="w-5 h-5 text-red-500"></i>
          </div>
          {urgentTasks.length === 0 ? (
            <div className="text-center py-8">
              <i data-lucide="check-circle" className="w-12 h-12 text-green-300 mx-auto mb-3"></i>
              <p className="text-gray-500">No urgent tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.projectName}</h4>
                    <p className="text-sm text-gray-600">
                      {clientTasks.find(t => t.id === task.id) ? task.clientName : task.category}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-red-600 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-red-600">
                    <i data-lucide="alert-triangle" className="w-5 h-5"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overdue Tasks</h3>
            <i data-lucide="calendar-x" className="w-5 h-5 text-red-500"></i>
          </div>
          {overdueTasks.length === 0 ? (
            <div className="text-center py-8">
              <i data-lucide="check-circle" className="w-12 h-12 text-green-300 mx-auto mb-3"></i>
              <p className="text-gray-500">No overdue tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.projectName}</h4>
                    <p className="text-sm text-gray-600">
                      {clientTasks.find(t => t.id === task.id) ? task.clientName : task.category}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Due: {new Date(task.dueDate!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-red-600">
                    <i data-lucide="calendar-x" className="w-5 h-5"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due Soon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Due Soon</h3>
            <i data-lucide="calendar-clock" className="w-5 h-5 text-orange-500"></i>
          </div>
          {dueSoonTasks.length === 0 ? (
            <div className="text-center py-8">
              <i data-lucide="calendar" className="w-12 h-12 text-gray-300 mx-auto mb-3"></i>
              <p className="text-gray-500">No tasks due soon</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueSoonTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.projectName}</h4>
                    <p className="text-sm text-gray-600">
                      {clientTasks.find(t => t.id === task.id) ? task.clientName : task.category}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Due: {new Date(task.dueDate!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-orange-600">
                    <i data-lucide="calendar-clock" className="w-5 h-5"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      {totalTasks > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-sm text-gray-600">{completedTasks} of {totalTasks} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completedPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>0%</span>
            <span className="font-medium">{completedPercentage}%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Welcome Message for New Users */}
      {totalTasks === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-200">
          <div className="text-blue-600 mb-4">
            <i data-lucide="star" className="w-16 h-16 mx-auto"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Kairo!</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You're all set! Start by creating your first task to begin managing your projects and personal tasks efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <i data-lucide="briefcase" className="w-5 h-5 inline mr-2"></i>
              Add Client Task
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              <i data-lucide="user" className="w-5 h-5 inline mr-2"></i>
              Add Personal Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}