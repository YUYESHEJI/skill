import React from 'react';
import { LayoutDashboard, Globe, Box, Activity, Glasses, Settings, Terminal, MessageSquareMore, Languages } from 'lucide-react';
import { ViewState, AppLanguage } from '../types';
import { APP_NAME, APP_VERSION, UI_TRANSLATIONS } from '../constants';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  language: AppLanguage;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, language, onOpenSettings }) => {
  const t = UI_TRANSLATIONS[language];

  const menuItems = [
    { id: ViewState.DASHBOARD, label: t.nav_dashboard, icon: LayoutDashboard },
    { id: ViewState.WORLD_BUILDER, label: t.nav_worldBuilder, icon: Globe },
    { id: ViewState.ASSET_FORGE, label: t.nav_assetForge, icon: Box },
    { id: ViewState.PHYSICS_LAB, label: t.nav_physicsLab, icon: Activity },
    { id: ViewState.LIVE_NPC, label: t.nav_liveNpc, icon: MessageSquareMore },
    { id: ViewState.MR_PREVIEW, label: t.nav_mrPreview, icon: Glasses },
    { id: ViewState.TRANSLATOR, label: t.nav_localization, icon: Languages },
  ];

  return (
    <aside className="w-64 h-screen bg-mvx-panel border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-mono font-bold text-white tracking-wider flex items-center gap-2">
          <Terminal className="text-mvx-accent w-6 h-6" />
          {APP_NAME}
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-mono">{APP_VERSION}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-mvx-accent/10 text-mvx-accent border border-mvx-accent/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-mvx-accent' : 'text-gray-500 group-hover:text-white'}`} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
            onClick={onOpenSettings}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors w-full group"
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-medium text-sm">{t.nav_settings}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;