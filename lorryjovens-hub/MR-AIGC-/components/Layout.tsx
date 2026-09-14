import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { ViewState, AppLanguage } from '../types';

interface LayoutProps {
  children: ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  language: AppLanguage;
  onOpenSettings: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, language, onOpenSettings }) => {
  return (
    <div className="min-h-screen bg-mvx-dark text-gray-200 font-sans selection:bg-mvx-accent/30 selection:text-white">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        language={language}
        onOpenSettings={onOpenSettings}
      />
      <main className="ml-64 p-8 min-h-screen relative">
        {/* Background Grid Effect */}
        <div 
            className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
            style={{ 
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                marginLeft: '16rem'
            }}
        ></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;