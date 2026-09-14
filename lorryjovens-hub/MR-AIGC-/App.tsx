import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WorldBuilder from './components/WorldBuilder';
import AssetForge from './components/AssetForge';
import PhysicsLab from './components/PhysicsLab';
import MRSimulator from './components/MRSimulator';
import LiveNPC from './components/LiveNPC';
import Translator from './components/Translator';
import SettingsModal from './components/SettingsModal';
import { ViewState, AppLanguage } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard language={language} />;
      case ViewState.WORLD_BUILDER:
        return <WorldBuilder language={language} />;
      case ViewState.ASSET_FORGE:
        return <AssetForge language={language} />;
      case ViewState.PHYSICS_LAB:
        return <PhysicsLab language={language} />;
      case ViewState.MR_PREVIEW:
        return <MRSimulator />;
      case ViewState.LIVE_NPC:
        return <LiveNPC />;
      case ViewState.TRANSLATOR:
        return <Translator />;
      default:
        return <Dashboard language={language} />;
    }
  };

  return (
    <>
        <Layout 
            currentView={currentView} 
            setView={setCurrentView}
            language={language}
            onOpenSettings={() => setIsSettingsOpen(true)}
        >
          {renderView()}
        </Layout>
        
        <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            language={language}
            setLanguage={setLanguage}
        />
    </>
  );
};

export default App;