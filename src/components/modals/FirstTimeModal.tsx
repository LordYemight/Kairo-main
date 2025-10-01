'use client';

import React from 'react';
import { Message } from '@/lib/types';

interface FirstTimeModalProps {
  isOpen: boolean;
  onSubmit: (data: { fullName: string; gender: string; email: string; whatsapp: string }) => void;
  onAddMessage: (message: Message) => void;
}

export default function FirstTimeModal({ isOpen, onSubmit, onAddMessage }: FirstTimeModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fullName = (form.elements.namedItem('user-fullname') as HTMLInputElement).value;
    const gender = (form.elements.namedItem('user-gender') as HTMLSelectElement).value;
    const email = (form.elements.namedItem('user-email') as HTMLInputElement).value;
    const whatsapp = (form.elements.namedItem('user-whatsapp') as HTMLInputElement).value;

    onSubmit({ fullName, gender, email, whatsapp });

    // Send welcome message
    const firstName = fullName.split(' ')[0];
    const welcomeText = `Hi ${firstName}, welcome to Kairo 👋

I'm Maayo, founder of Kairo — and I'm thrilled you're here.

Kairo was built to help busy people and teams take control of their day — not just at work, but in life. Whether you're managing client deadlines, household priorities, payments, or personal goals, Kairo brings everything into one calm place so you can think clearly and act with confidence.

WHY KAIRO MATTERS
• Clarity — See every commitment (client tasks + personal tasks) in one place so nothing slips through the cracks.
• Prioritization — Smart due-date and urgency helpers surface the right tasks so you tackle what matters now.
• Focus — Use Focus Mode when you need uninterrupted time to complete important work (try a 25-minute session).
• Organization across life & work — Keep client workflows and personal projects separate but visible together, protecting your time and energy.
• Payments & progress — Track fees, outstanding amounts and project progress so money and tasks stay aligned.
• Reflect & improve — Analytics and task history help you learn what works and get better each week.

HOW THIS HELPS YOU — PRACTICAL BENEFITS
• Spend less time deciding what to do next and more time doing it.
• Reduce stress with reliable reminders and a single source of truth.
• Improve delivery and client trust by tracking deadlines and payments.
• Build better personal habits: plan workouts, bills, learning, or family time alongside work tasks.
• Export, import, and back up your data anytime.

QUICK FIRST STEPS
1. Add your first task — click "+" or use **Add Client Task** / **Add Personal Task**.
2. Connect or import — link your calendar or upload tasks to get started fast.
3. Set notifications — choose reminders for overdue items, upcoming deadlines, and payments.
4. Try Focus Mode — pick one in-progress task and start a 25-minute focus session.
5. Explore Kairo Board & Calendar — drag tasks, set priorities, and view due dates visually.

NEED HELP OR FEEDBACK?
Reply to this message or go to **About → Contact**. I review early-user feedback personally — tell me what would make Kairo even more useful for you.

Welcome again — here's to calmer days, clearer priorities, and getting the right things done.

Warmly,  
Maayo  
Founder, Kairo`;

    const newMessage: Message = {
      id: Date.now(),
      from: 'Maayo',
      subject: 'Welcome to Kairo!',
      body: welcomeText,
      date: new Date().toISOString(),
      read: false
    };
    onAddMessage(newMessage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 first-time-modal">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-blue-600">Welcome to Kairo!</h3>
          <p className="text-blue-600 mt-1">Your Task Management space</p>
          <p className="text-gray-600 mt-2">Please provide your details to get started</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="form-input-group">
            <label className="form-label">
              <span className="form-emoji">👤</span> Full Name
            </label>
            <input
              name="user-fullname"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-input-group">
            <label className="form-label">
              <span className="form-emoji">⚧️</span> Gender
            </label>
            <select
              name="user-gender"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div className="form-input-group">
            <label className="form-label">
              <span className="form-emoji">📧</span> Gmail
            </label>
            <input
              name="user-email"
              type="email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="form-input-group">
            <label className="form-label">
              <span className="form-emoji">📱</span> WhatsApp Contact
            </label>
            <input
              name="user-whatsapp"
              type="tel"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your WhatsApp number"
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit & Continue
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-4 text-center">
          By submitting this form, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}