import React from 'react';
import { X, Globe, Cpu, Monitor, Volume2, Languages, Check } from 'lucide-react';
import { AppLanguage } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, language, setLanguage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-mvx-panel border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="text-mvx-accent" />
            {language === 'en' ? 'Engine Configuration' : '引擎配置'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex gap-6">
          {/* Sidebar */}
          <div className="w-1/3 space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-mvx-accent/10 text-mvx-accent border border-mvx-accent/20 font-medium text-sm flex items-center gap-3">
              <Languages size={18} />
              {language === 'en' ? 'Localization' : '语言设置'}
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 font-medium text-sm flex items-center gap-3 transition-colors">
              <Monitor size={18} />
              {language === 'en' ? 'Graphics & MR' : '图形与MR'}
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 font-medium text-sm flex items-center gap-3 transition-colors">
              <Volume2 size={18} />
              {language === 'en' ? 'Audio & Voice' : '音频与语音'}
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 font-medium text-sm flex items-center gap-3 transition-colors">
              <Globe size={18} />
              {language === 'en' ? 'Network & API' : '网络与API'}
            </button>
          </div>

          {/* Settings Panel */}
          <div className="flex-1 bg-black/20 rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">
               {language === 'en' ? 'Interface Language' : '界面语言'}
            </h3>

            <div className="space-y-4">
                <label className="block text-sm text-gray-400 mb-2">
                    {language === 'en' ? 'Select Primary Language' : '选择主语言'}
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            language === 'en' 
                            ? 'bg-mvx-secondary/20 border-mvx-secondary text-white shadow-[0_0_15px_rgba(112,0,255,0.2)]' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        <span className="text-2xl">🇺🇸</span>
                        <span className="font-bold">English</span>
                        {language === 'en' && <Check size={16} className="text-mvx-secondary" />}
                    </button>

                    <button 
                        onClick={() => setLanguage('cn')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            language === 'cn' 
                            ? 'bg-mvx-secondary/20 border-mvx-secondary text-white shadow-[0_0_15px_rgba(112,0,255,0.2)]' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        <span className="text-2xl">🇨🇳</span>
                        <span className="font-bold">中文 (Chinese)</span>
                        {language === 'cn' && <Check size={16} className="text-mvx-secondary" />}
                    </button>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <h4 className="text-sm font-bold text-white mb-3">
                    {language === 'en' ? 'Translation Model' : '翻译模型'}
                </h4>
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <span className="text-sm text-gray-300">Gemini 2.5 Flash (Fast)</span>
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(0,255,0,0.5)]"></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {language === 'en' 
                        ? 'Used for UI translation and real-time localization tools.' 
                        : '用于界面翻译和实时本地化工具。'}
                </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/40 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
                {language === 'en' ? 'Close' : '关闭'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;