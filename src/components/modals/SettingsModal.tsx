'use client';

import React, { useState } from 'react';
import { Settings } from '../../lib/types';
import { themes } from '../../lib/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [formData, setFormData] = useState<Settings>(settings);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle logo upload if a file is selected
    if (logoFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoDataUrl = event.target?.result as string;
        onSave({ ...formData, logo: logoDataUrl });
        onClose();
      };
      reader.readAsDataURL(logoFile);
    } else {
      onSave(formData);
      onClose();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo: '' });
    setLogoFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                required
              />
            </div>


          </div>

          {/* Logo Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>
            
            <div className="form-group">
              <label className="form-label">Upload Logo</label>
              {formData.logo && (
                <div className="mb-3 flex items-center gap-3">
                  <img 
                    src={formData.logo} 
                    alt="Current logo" 
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove logo
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="form-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a square image (recommended: 200x200px or larger)
              </p>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
            
            <div className="form-group">
              <label className="form-label">Theme Color</label>
              <select
                className="form-input"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="red">Red</option>
                <option value="orange">Orange</option>
                <option value="teal">Teal</option>
              </select>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.darkMode}
                  onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="form-label mb-0">Enable Dark Mode</span>
              </label>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sidebarCollapsed}
                  onChange={(e) => setFormData({ ...formData, sidebarCollapsed: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="form-label mb-0">Collapse Sidebar by Default</span>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            
            <div className="form-group">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.notifications.overdue}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    notifications: { ...formData.notifications, overdue: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="form-label mb-0">Overdue Task Notifications</span>
              </label>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.notifications.upcoming}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    notifications: { ...formData.notifications, upcoming: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="form-label mb-0">Upcoming Task Notifications</span>
              </label>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.notifications.updates}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    notifications: { ...formData.notifications, updates: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="form-label mb-0">Task Update Notifications</span>
              </label>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.notifications.payments}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    notifications: { ...formData.notifications, payments: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="form-label mb-0">Payment Notifications</span>
              </label>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
            
            <div className="space-y-3">
              <button
                type="button"
                className="w-full text-left p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={() => {
                  const data = {
                    clientTasks: JSON.parse(localStorage.getItem('clientTasks') || '[]'),
                    personalTasks: JSON.parse(localStorage.getItem('personalTasks') || '[]'),
                    settings: JSON.parse(localStorage.getItem('settings') || '{}'),
                    messages: JSON.parse(localStorage.getItem('messages') || '[]'),
                    notifications: JSON.parse(localStorage.getItem('notifications') || '[]')
                  };
                  
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `kairo-backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                <div className="flex items-center gap-3">
                  <i data-lucide="download" className="w-5 h-5"></i>
                  <div>
                    <div className="font-medium">Export Data</div>
                    <div className="text-sm opacity-75">Download all your tasks and settings</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="w-full text-left p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <i data-lucide="trash-2" className="w-5 h-5"></i>
                  <div>
                    <div className="font-medium">Clear All Data</div>
                    <div className="text-sm opacity-75">Remove all tasks, settings, and messages</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity font-medium bg-gradient-to-r ${themes[formData.theme as keyof typeof themes]}`}
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}