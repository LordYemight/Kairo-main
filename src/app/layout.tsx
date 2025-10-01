import "./globals.css";
import Script from 'next/script';
import React, { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // initialize EmailJS via global script (included below) with placeholder key
    try { (window as any).emailjs?.init('YOUR_PUBLIC_KEY_HERE'); } catch (e) { /* noop */ }
  }, []);

  return (
    <html lang="en">
      <head />
      <body className="bg-gray-50 min-h-screen">
        {/* External scripts that the original page used via CDN */}
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js" strategy="afterInteractive" />
        {/* EmailJS is already imported via npm but keep fallback script for parity */}
        <Script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js" strategy="afterInteractive" />

        {/* Preserve original global styles from HTML in a style tag so rules remain identical */}
        <style dangerouslySetInnerHTML={{ __html: `
        :root { --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; transition: var(--transition); }
        .task-card { transition: var(--transition); border-radius: 1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
        .task-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
        .progress-bar { transition: width 0.5s ease-in-out; border-radius: 999px; }
        .notification { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .dark-mode { background-color: #111827; color: #e5e7eb; }
        .dark-mode .card, .dark-mode .bg-white { background-color: #1f2937; color: #f9fafb; border-color: #374151; }
        .dark-mode input, .dark-mode textarea, .dark-mode select { background-color: #111827; border-color: #374151; color: #f9fafb; }
        .dark-mode input::placeholder, .dark-mode textarea::placeholder { color: #9ca3af; }
        .kairo-column { min-height: 500px; border-radius: 1rem; background: #f9fafb; }
        .dark-mode .kairo-column { background: #1f2937; }
        .kairo-task { cursor: move; border-radius: 0.75rem; }
        .calendar-day { cursor: pointer; transition: var(--transition); min-height: 80px; display: flex; flex-direction: column; }
        .calendar-day:hover { background-color: #f0f9ff; }
        .calendar-day.has-tasks { background-color: #e0f2fe; }
        .dark-mode .calendar-day.has-tasks { background-color: #1e3a8a; }
        .dark-mode .calendar-day:hover { background-color: #1f2937; }
        .notification-item { border-left: 3px solid; }
        .notification-info { border-left-color: #3b82f6; }
        .notification-success { border-left-color: #10b981; }
        .notification-warning { border-left-color: #f59e0b; }
        .notification-error { border-left-color: #ef4444; }
        .sidebar-collapsed { width: 64px !important; }
        .sidebar-collapsed .sidebar-text, .sidebar-collapsed .quick-stats { display: none; }
        .sidebar-collapsed .nav-button { justify-content: center; padding: 0.75rem; }
        .payment-progress { height: 6px; border-radius: 3px; }
        .calendar-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .details-dropdown { transition: all 0.3s ease; overflow: hidden; }
        .details-dropdown.closed { max-height: 0; opacity: 0; }
        .details-dropdown.open { max-height: 500px; opacity: 1; }
        .dropdown-chevron { transition: transform 0.3s ease; }
        .dropdown-chevron.rotated { transform: rotate(180deg); }
        .focus-mode-active { overflow: hidden; }
        .focus-mode-active #sidebar, .focus-mode-active #header, .focus-mode-active #quick-add-button, .focus-mode-active #notifications-button, .focus-mode-active #settings-button, .focus-mode-active #dark-mode-toggle { display: none !important; }
        .task-type-selector { position: fixed; bottom: 6rem; right: 6rem; background: white; border-radius: 1.25rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); z-index: 40; overflow: hidden; transition: all 0.3s ease; transform-origin: bottom right; }
        .task-type-selector.hidden { transform: scale(0); opacity: 0; }
        .task-type-option { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; cursor: pointer; transition: background-color 0.2s; }
        .task-type-option:hover { background-color: #f3f4f6; }
        .task-type-option:not(:last-child) { border-bottom: 1px solid #e5e7eb; }
        .about-section { margin-bottom: 2rem; }
        .benefit-item { display: flex; align-items: flex-start; margin-bottom: 1.25rem; }
        .benefit-icon { background-color: #dbeafe; border-radius: 50%; padding: 0.625rem; margin-right: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .contact-info { display: flex; align-items: center; margin-bottom: 0.75rem; }
        .contact-icon { margin-right: 0.5rem; width: 20px; text-align: center; }
        .first-time-modal { z-index: 100; }
        .form-input-group { margin-bottom: 1.5rem; }
        .form-label { display: flex; align-items: center; margin-bottom: 0.5rem; font-weight: 600; color: #1f2937; }
        .dark-mode .form-label { color: #f9fafb; }
        .form-emoji { margin-right: 0.5rem; font-size: 1.25rem; }
        .copy-icon { cursor: pointer; margin-left: 0.5rem; opacity: 0.7; transition: opacity 0.2s; }
        .copy-icon:hover { opacity: 1; }
        .hidden-amount { filter: blur(2px); user-select: none; }
        @media (max-width: 768px) { #sidebar { position: fixed; left: -100%; z-index: 40; height: 100vh; transition: left 0.3s ease; } #sidebar.mobile-open { left: 0; } #main-content { margin-left: 0 !important; width: 100%; } .kairo-column { min-height: 300px; } .calendar-day { min-height: 60px; padding: 0.25rem; } .calendar-day span { font-size: 0.75rem; } #header .max-w-7xl { padding: 0 1rem; } .grid-cols-1 { grid-template-columns: 1fr; } .grid-cols-7 { grid-template-columns: repeat(7, minmax(0, 1fr)); } .task-card { margin-bottom: 1rem; } #quick-add-button { bottom: 5rem; right: 1rem; } .task-type-selector { bottom: 10rem; right: 1rem; } }
        @media (max-width: 640px) { .flex.max-w-7xl { flex-direction: column; } #header .flex.justify-between { flex-direction: column; gap: 1rem; } .calendar-nav { flex-direction: column; gap: 1rem; } .grid.grid-cols-7 .p-3 { padding: 0.5rem; font-size: 0.75rem; } }
        `}} />

        {children}
      </body>
    </html>
  );
}
