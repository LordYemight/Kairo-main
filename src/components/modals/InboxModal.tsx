'use client';

import React, { useState } from 'react';
import { Message } from '../../lib/types';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onMarkAsRead: (messageId: number) => void;
  onMarkAllAsRead: () => void;
  onDeleteMessage: (messageId: number) => void;
  onClearAll: () => void;
}

export default function InboxModal({ 
  isOpen, 
  onClose, 
  messages, 
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteMessage,
  onClearAll
}: InboxModalProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.read).length;

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      onMarkAsRead(message.id);
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    if (selectedMessage && selectedMessage.id === messageId) {
      setSelectedMessage(null);
    }
    onDeleteMessage(messageId);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all messages? This action cannot be undone.')) {
      setSelectedMessage(null);
      onClearAll();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
      <div className="bg-white rounded-xl w-full max-w-6xl mx-4 h-[85vh] flex overflow-hidden">
        {/* Message List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Inbox {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <i data-lucide="x" className="w-5 h-5"></i>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <i data-lucide="search" className="w-4 h-4 text-gray-400 absolute left-3 top-3"></i>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
                disabled={messages.length === 0}
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <i data-lucide="mail" className="w-16 h-16 mx-auto"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No messages found' : 'No messages yet'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Messages will appear here when you receive them.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMessages.map(message => (
                  <div 
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    } ${!message.read ? 'bg-blue-25' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {message.from}
                        </h4>
                        {!message.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(message.date).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(message.id);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <i data-lucide="trash-2" className="w-3 h-3"></i>
                        </button>
                      </div>
                    </div>
                    <h5 className={`text-sm mb-1 ${!message.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {message.subject}
                    </h5>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {message.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <i data-lucide="user" className="w-4 h-4"></i>
                        <span>From: {selectedMessage.from}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i data-lucide="calendar" className="w-4 h-4"></i>
                        <span>{new Date(selectedMessage.date).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedMessage.read && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        New
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                    >
                      <i data-lucide="trash-2" className="w-4 h-4"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedMessage.body}
                  </div>
                </div>
              </div>

              {/* Message Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Message ID: {selectedMessage.id}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const currentIndex = filteredMessages.findIndex(m => m.id === selectedMessage.id);
                        const prevMessage = filteredMessages[currentIndex - 1];
                        if (prevMessage) {
                          handleMessageClick(prevMessage);
                        }
                      }}
                      disabled={filteredMessages.findIndex(m => m.id === selectedMessage.id) === 0}
                      className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i data-lucide="chevron-left" className="w-4 h-4 inline mr-1"></i>
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        const currentIndex = filteredMessages.findIndex(m => m.id === selectedMessage.id);
                        const nextMessage = filteredMessages[currentIndex + 1];
                        if (nextMessage) {
                          handleMessageClick(nextMessage);
                        }
                      }}
                      disabled={filteredMessages.findIndex(m => m.id === selectedMessage.id) === filteredMessages.length - 1}
                      className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <i data-lucide="chevron-right" className="w-4 h-4 inline ml-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <i data-lucide="mail-open" className="w-16 h-16 mx-auto"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Message</h3>
                <p className="text-gray-500">Choose a message from the list to read its contents.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}