'use client';

import React from 'react';
import Dashboard from './pages/Dashboard';
// Temporarily commented out imports to resolve module resolution issues
// import ClientTasksPage from './pages/ClientTasksPage';
// import PersonalTasksPage from './pages/PersonalTasksPage';
// import DueSoonPage from './pages/DueSoonPage';
// import KairoBoard from './pages/KairoBoard';
// import CalendarPage from './pages/CalendarPage';
// import AnalyticsPage from './pages/AnalyticsPage';
// import AboutPage from './pages/AboutPage';

interface MainContentProps {
  appState: any;
}

export default function MainContent({ appState }: MainContentProps) {
  const { currentPage, settings } = appState;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard appState={appState} />;
      // Temporarily commented out to resolve import issues
      // case 'client':
      //   return <ClientTasksPage appState={appState} />;
      // case 'personal':
      //   return <PersonalTasksPage appState={appState} />;
      // case 'due-soon':
      //   return <DueSoonPage appState={appState} />;
      // case 'kairo':
      //   return <KairoBoard appState={appState} />;
      // case 'calendar':
      //   return <CalendarPage appState={appState} />;
      // case 'analytics':
      //   return <AnalyticsPage appState={appState} />;
      // case 'about':
      //   return <AboutPage appState={appState} />;
      default:
        return <Dashboard appState={appState} />;
    }
  };

  return (
    <main className={`flex-1 p-6 transition-all duration-300 ${
      settings.sidebarCollapsed ? 'ml-2' : ''
    }`}>
      {renderPage()}
    </main>
  );
}