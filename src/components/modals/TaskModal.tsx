'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { statusOptions } from '@/lib/constants';
import { parseAmount, formatAmount, updateTaskPriorityBasedOnDueDate } from '@/lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  taskType: 'client' | 'personal';
  editingTask: Task | null;
  tags: string[];
  setTags: (tags: string[]) => void;
  selectedCalendarDate: Date | null;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskType,
  editingTask,
  tags,
  setTags,
  selectedCalendarDate
}: TaskModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    description: '',
    files: '',
    startDate: '',
    dueDate: '',
    status: 'Not Started',
    priority: 'Medium',
    totalAmount: '',
    amountPaid: '',
    outstandingAmount: '',
    category: '',
    currency: '₦'
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        clientName: editingTask.clientName || '',
        projectName: editingTask.projectName,
        description: editingTask.description || '',
        files: editingTask.files || '',
        startDate: editingTask.startDate || '',
        dueDate: editingTask.dueDate || '',
        status: editingTask.status,
        priority: editingTask.priority,
        totalAmount: editingTask.totalAmount || '',
        amountPaid: editingTask.amountPaid || '',
        outstandingAmount: editingTask.outstandingAmount || '',
        category: editingTask.category || '',
        currency: editingTask.currency || '₦'
      });
      setTags(editingTask.tags || []);
    } else {
      setFormData({
        clientName: '',
        projectName: '',
        description: '',
        files: '',
        startDate: '',
        dueDate: selectedCalendarDate ? selectedCalendarDate.toISOString().split('T')[0] : '',
        status: 'Not Started',
        priority: 'Medium',
        totalAmount: '',
        amountPaid: '',
        outstandingAmount: '',
        category: '',
        currency: '₦'
      });
      setTags([]);
    }
  }, [editingTask, selectedCalendarDate, setTags]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      ...formData,
      tags,
      priority: updateTaskPriorityBasedOnDueDate({
        ...formData,
        id: 0,
        status: formData.status
      } as Task)
    };

    if (taskType === 'client') {
      taskData.clientName = formData.clientName;
    }

    onSave(taskData);
    onClose();
  };

  const updateOutstandingAmount = () => {
    const totalAmount = parseAmount(formData.totalAmount);
    const amountPaid = parseAmount(formData.amountPaid);
    const outstandingValue = Math.max(0, totalAmount.value - amountPaid.value);
    const outstandingAmount = formatAmount(totalAmount.currency, outstandingValue);
    setFormData(prev => ({ ...prev, outstandingAmount }));
  };

  const addTag = () => {
    const input = document.getElementById('tag-input') as HTMLInputElement;
    const tag = input.value.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      input.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingTask ? 'Edit' : 'Add'} {taskType === 'client' ? 'Client' : 'Personal'} Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {taskType === 'client' && (
            <div className="form-input-group">
              <label className="form-label">
                <span className="form-emoji">🏢</span> Client Name
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client name"
                required
              />
            </div>
          )}

          <div className="form-input-group">
            <label className="form-label">
              <span className="form-emoji">📋</span> Project Name
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="form-input-group">
            <label className="form-label">
              <span className="form-emoji">📝</span> Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-input-group">
              <label className="form-label">
                <span className="form-emoji">📅</span> Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="form-input-group">
              <label className="form-label">
                <span className="form-emoji">⏰</span> Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-input-group">
              <label className="form-label">
                <span className="form-emoji">📊</span> Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="form-input-group">
              <label className="form-label">
                <span className="form-emoji">🚩</span> Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {taskType === 'personal' && (
            <div className="form-input-group">
              <label className="form-label">
                <span className="form-emoji">🏷️</span> Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category"
              />
            </div>
          )}

          <div className="form-input-group">
            <label className="form-label">
              <span className="form-emoji">🏷️</span> Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="tag-input"
                type="text"
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-input-group">
            <label className="form-label">
              <span className="form-emoji">💰</span> Payment Details
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={formData.totalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                onBlur={updateOutstandingAmount}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Total Amount"
              />
              <input
                type="text"
                value={formData.amountPaid}
                onChange={(e) => setFormData(prev => ({ ...prev, amountPaid: e.target.value }))}
                onBlur={updateOutstandingAmount}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Amount Paid"
              />
              <input
                type="text"
                value={formData.outstandingAmount}
                readOnly
                className="p-3 border rounded-lg bg-gray-50"
                placeholder="Outstanding"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}