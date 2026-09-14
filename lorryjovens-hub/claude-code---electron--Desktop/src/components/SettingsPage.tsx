import React, { useState, useEffect } from 'react';
import { ChevronRight, Smartphone, MonitorIcon, LogOut, MoreHorizontal, Check, X } from 'lucide-react';
import { getProviderModels } from '../api';
import ProviderSettings from './ProviderSettings';

interface SettingsPageProps {
  onClose: () => void;
}

const WORK_OPTIONS = [
  '', '软件工程', '产品管理', '数据科学',
  '市场营销', '设计', '研究', '教育', '金融',
  '法律', '医疗健康', '其他',
];

type Tab = 'general' | 'account' | 'usage';

const SettingsPage = ({ onClose }: SettingsPageProps) => {
  const [tab, setTab] = useState<Tab>('general');
  const [profile, setProfile] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Form state
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [workFunction, setWorkFunction] = useState('');
  const [personalPreferences, setPersonalPreferences] = useState('');
  const [theme, setTheme] = useState('light');
  const [chatFont, setChatFont] = useState('default');
  const [defaultModel, setDefaultModel] = useState('claude-opus-4-6-thinking');
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; sessionId: string } | null>(null);
  const [sendKey, setSendKey] = useState(localStorage.getItem('sendKey') || 'enter');
  const [newlineKey, setNewlineKey] = useState(localStorage.getItem('newlineKey') || (localStorage.getItem('sendKey') === 'enter' ? 'shift_enter' : 'enter'));

  const isSelfHosted = localStorage.getItem('user_mode') === 'selfhosted';

  useEffect(() => {
    // Load profile from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const p = { ...user, ...saved };
      setProfile(p);
      setFullName(p.full_name || p.nickname || '');
      setDisplayName(p.display_name || p.nickname || '');
      setWorkFunction(p.work_function || '');
      setPersonalPreferences(p.personal_preferences || '');
    } catch { }
    getUserUsage().then(setUsage).catch(() => { });
  }, []);

  const handleSave = async (silent = false) => {
    if (!silent) {
      setSaving(true);
      setSaveMsg('');
    }
    try {
      const profileData = {
        full_name: fullName,
        display_name: displayName,
        work_function: workFunction,
        personal_preferences: personalPreferences,
        theme,
        chat_font: chatFont,
      };
      if (isSelfHosted) {
        localStorage.setItem('user_profile', JSON.stringify(profileData));
        setProfile(profileData);
      }
      window.dispatchEvent(new Event('userProfileUpdated'));
      if (!silent) {
        setSaveMsg('已保存');
        setTimeout(() => setSaveMsg(''), 2000);
      }
    } catch (err: any) {
      if (!silent) setSaveMsg(err.message || '保存失败');
    } finally {
      if (!silent) setSaving(false);
    }
  };

  // Auto-save on blur or selection
  const handleAutoSave = () => {
    // Optional: implement auto-save debounce if needed, currently manual save button is also fine
    // The screenshot shows a clean interface, maybe we can auto-save
    // But for now, let's keep the explicit save button as it's safer for "no new function" logic, 
    // or just match the UI. Official Claude settings mostly auto-save or have small confirms.
    // I'll keep the Save button for Profile but make Theme instant.
  };

  const applyTheme = (t: string) => {
    setTheme(t);
    const root = document.documentElement;
    if (t === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else if (t === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      root.classList.toggle('dark', prefersDark);
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', t);
    // Auto-save theme
    updateUserProfile({ theme: t }).catch(() => { });
  };

  const applyFont = (f: string) => {
    setChatFont(f);
    document.documentElement.setAttribute('data-chat-font', f);
    localStorage.setItem('chat_font', f);
    updateUserProfile({ chat_font: f }).catch(() => { });
  };

  const HARDCODED_MODELS = [
    { base: 'claude-opus-4-6', label: 'Opus 4.6' },
    { base: 'claude-sonnet-4-6', label: 'Sonnet 4.6' },
    { base: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5' },
  ];
  const [providerModels, setProviderModels] = useState<Array<{ base: string; label: string }>>([]);

  useEffect(() => {
    if (isSelfHosted) {
      getProviderModels().then(models => {
        setProviderModels(models.map(m => ({ base: m.id, label: m.name || m.id })));
      }).catch(() => { });
    }
  }, [isSelfHosted]);

  const MODEL_BASES = isSelfHosted && providerModels.length > 0 ? providerModels : HARDCODED_MODELS;

  const defaultModelIsThinking = defaultModel.endsWith('-thinking');
  const defaultModelBase = defaultModel.replace(/-thinking$/, '');

  const applyDefaultModel = (base: string, thinking: boolean) => {
    const m = thinking ? `${base}-thinking` : base;
    setDefaultModel(m);
    localStorage.setItem('default_model', m);
    updateUserProfile({ default_model: m }).catch(() => { });
  };

  const initials = (fullName || profile?.nickname || 'U').charAt(0).toUpperCase();

  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=DM+Serif+Display&family=EB+Garamond:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300&family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Font selector options
  return (
    <div className="flex-1 flex h-full overflow-hidden bg-claude-bg text-claude-text">
      {/* Left Sidebar Navigation */}
      <div className="w-[200px] flex-shrink-0 pt-16 pl-8 flex flex-col gap-1">
        <h2
          className="font-[Spectral] text-[28px] text-claude-text px-3 mb-6"
          style={{
            fontWeight: 500,
            WebkitTextStroke: '0.5px currentColor'
          }}
        >
          Settings
        </h2>

        <button
          onClick={() => setTab('general')}
          className={`text-left px-3 py-2 rounded-lg text-[15px] font-medium transition-colors ${tab === 'general' ? 'bg-claude-btn-hover text-claude-text' : 'text-claude-textSecondary hover:bg-claude-hover'
            }`}
        >
          General
        </button>
        <button
          onClick={() => setTab('models')}
          className={`text-left px-3 py-2 rounded-lg text-[15px] font-medium transition-colors ${tab === 'models' ? 'bg-claude-btn-hover text-claude-text' : 'text-claude-textSecondary hover:bg-claude-hover'
            }`}
        >
          Models
        </button>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-6xl pt-16 pl-12 pb-32 pr-12">
          {tab === 'general' && renderGeneral()}
          {tab === 'models' && <ProviderSettings />}
        </div>
      </div>
    </div>
  );

  function renderGeneral() {
    return (
      <div className="space-y-10 animate-fade-in">
        {/* Profile Section */}
        <section>
          <h3 className="text-[16px] font-semibold text-claude-text mb-5">个人资料</h3>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-medium text-claude-textSecondary mb-1.5">全名</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-claude-avatar text-claude-avatarText flex items-center justify-center text-[16px] font-medium flex-shrink-0">
                    {initials}
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onBlur={() => handleSave(true)}
                    className="flex-1 px-3 py-2 bg-claude-input border border-claude-border rounded-md text-[14px] text-claude-text focus:outline-none focus:border-[#387ee0] focus:ring-0 transition-all placeholder-claude-textSecondary"
                    placeholder="输入你的全名"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-claude-textSecondary mb-1.5">Claude 应该怎么称呼你？</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  onBlur={() => handleSave(true)}
                  className="w-full px-3 py-2 bg-claude-input border border-claude-border rounded-md text-[14px] text-claude-text focus:outline-none focus:border-[#387ee0] focus:ring-0 transition-all placeholder-claude-textSecondary"
                  placeholder="例如你的名字或昵称"
                />
              </div>
            </div>

            {/* Work Function */}
            <div>
              <label className="block text-[13px] font-medium text-claude-textSecondary mb-1.5">你的职业是什么？</label>
              <div className="relative">
                <select
                  value={workFunction}
                  onChange={e => { setWorkFunction(e.target.value); setTimeout(() => handleSave(true), 100); }}
                  className="w-full px-3 py-2.5 bg-claude-input border border-claude-border rounded-md text-[14px] text-claude-text focus:outline-none focus:border-[#387ee0] focus:ring-0 transition-all appearance-none cursor-pointer"
                >
                  <option value="">选择你的职业</option>
                  {WORK_OPTIONS.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-claude-textSecondary pointer-events-none" />
              </div>
            </div>

            {/* Personal Preferences */}
            <div>
              <label className="block text-[13px] font-medium text-claude-textSecondary mb-1">Claude 在回复中应考虑哪些个人偏好？</label>
              <p className="text-[12px] text-claude-textSecondary/60 mb-2">你的偏好将应用于所有对话。</p>
              <textarea
                value={personalPreferences}
                onChange={e => setPersonalPreferences(e.target.value)}
                onBlur={() => handleSave(true)}
                rows={3}
                className="w-full px-3 py-2.5 bg-claude-input border border-claude-border rounded-md text-[14px] text-claude-text focus:outline-none focus:border-[#387ee0] focus:ring-0 transition-all resize-none placeholder-claude-textSecondary"
                placeholder="例如：回答尽量简洁，使用中文，代码注释用英文"
              />
            </div>

          </div>
        </section>

        {/* Default Model Section */}
        <hr className="border-claude-border" />
        <section>
          <h3 className="text-[16px] font-semibold text-claude-text mb-5">默认模型</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-claude-textSecondary mb-1.5">新对话默认使用的模型</label>
              <div className="relative">
                <select
                  value={defaultModelBase}
                  onChange={e => applyDefaultModel(e.target.value, defaultModelIsThinking)}
                  className="w-full px-3 py-2 bg-claude-input border border-claude-border rounded-md text-[14px] text-claude-text focus:outline-none focus:border-[#387ee0] focus:ring-0 appearance-none transition-all"
                >
                  {MODEL_BASES.map(m => (
                    <option key={m.base} value={m.base}>{m.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-claude-textSecondary">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-claude-textSecondary">扩展思考</div>
                <div className="text-[12px] text-claude-textSecondary mt-0.5">让模型在回答前进行深度思考</div>
              </div>
              <button
                onClick={() => applyDefaultModel(defaultModelBase, !defaultModelIsThinking)}
                className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${defaultModelIsThinking ? 'bg-blue-600' : 'bg-[#E5E5E5]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${defaultModelIsThinking ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Send Key Section */}
        <section>
          <h3 className="text-[16px] font-semibold text-claude-text mb-5">发送消息</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-claude-textSecondary mb-1.5">发送消息</label>
              <div className="relative">
                <select
                  value={sendKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSendKey(val);
                    localStorage.setItem('sendKey', val);
                    // Smart auto-switch for newline to avoid conflict
                    if (val === 'enter' && newlineKey === 'enter') {
                      setNewlineKey('shift_enter');
                      localStorage.setItem('newlineKey', 'shift_enter');
                    } else if (val === 'ctrl_enter' && newlineKey === 'ctrl_enter') {
                      setNewlineKey('enter');
                      localStorage.setItem('newlineKey', 'enter');
                    }
                  }}
                  className="w-full px-3 py-2 bg-claude-input border border-claude-border rounded-md text-[14px] text-claude-text focus:outline-none focus:border-[#387ee0] focus:ring-0 appearance-none transition-all"
                >
                  <option value="enter">Enter</option>
                  <option value="ctrl_enter">Ctrl+Enter</option>
                  <option value="cmd_enter">Cmd+Enter</option>
                  <option value="alt_enter">Alt+Enter</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-claude-textSecondary">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-claude-textSecondary mb-1.5">换行</label>
              <div className="relative">
                <select
                  value={newlineKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewlineKey(val);
                    localStorage.setItem('newlineKey', val);
                  }}
                  className="w-full px-3 py-2 bg-claude-input border border-claude-border rounded-md text-[14px] text-claude-text focus:outline-none focus:border-[#387ee0] focus:ring-0 appearance-none transition-all"
                >
                  <option value="enter">Enter</option>
                  <option value="shift_enter">Shift+Enter</option>
                  <option value="ctrl_enter">Ctrl+Enter</option>
                  <option value="alt_enter">Alt+Enter</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-claude-textSecondary">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-claude-border" />

        {/* Appearance Section */}
        <section>
          <h3 className="text-[16px] font-semibold text-claude-text mb-5">外观</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-medium text-claude-textSecondary mb-2">颜色模式</label>
              <div className="flex gap-3">
                {([
                  { value: 'light', label: 'Light' },
                  { value: 'auto', label: 'Auto' },
                  { value: 'dark', label: 'Dark' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => applyTheme(opt.value)}
                    className="group flex flex-col items-center gap-3"
                  >
                    <div className={`
                      w-32 h-20 rounded-lg border transition-all relative overflow-hidden flex flex-col shadow-sm
                      ${theme === opt.value
                        ? 'border-[#3b82f6]/80 scale-[1.02]'
                        : 'border-claude-border group-hover:border-[#CCC]'
                      }
                    `}>
                      {/* Theme Preview Content */}
                      {opt.value === 'light' && (
                        <div className="flex-1 bg-[#F5F4F1] p-2 flex flex-col gap-1.5">
                          <div className="flex justify-end mb-0.5">
                            <div className="w-10 h-2.5 bg-[#E3E3E0] rounded-full"></div>
                          </div>
                          <div className="w-12 h-1 bg-[#E3E3E0] rounded-full mb-0.5"></div>
                          <div className="w-16 h-1 bg-[#E3E3E0] rounded-full"></div>
                          <div className="mt-auto bg-white rounded border border-[#E3E3E0] h-6 w-full flex items-center justify-end px-1">
                            <div className="w-2 h-2 bg-[#D97757] rounded-full"></div>
                          </div>
                        </div>
                      )}

                      {opt.value === 'dark' && (
                        <div className="flex-1 bg-[#1F1F1E] p-2 flex flex-col gap-1.5">
                          <div className="flex justify-end mb-0.5">
                            <div className="w-10 h-2.5 bg-[#404040] rounded-full"></div>
                          </div>
                          <div className="w-12 h-1 bg-[#404040] rounded-full mb-0.5"></div>
                          <div className="w-16 h-1 bg-[#404040] rounded-full"></div>
                          <div className="mt-auto bg-[#30302E] rounded border border-[#323130] h-6 w-full flex items-center justify-end px-1">
                            <div className="w-2 h-2 bg-[#D97757] rounded-full"></div>
                          </div>
                        </div>
                      )}

                      {opt.value === 'auto' && (
                        <div className="flex-1 flex w-full h-full">
                          <div className="w-1/2 bg-[#555] p-2 flex flex-col gap-1.5 border-r border-white/10">
                            <div className="w-8 h-1 bg-white/20 rounded-full mb-0.5"></div>
                            <div className="w-10 h-1 bg-white/20 rounded-full"></div>
                            <div className="mt-auto bg-white/90 rounded h-6 w-[140%] -ml-1 flex items-center px-1 z-10 shadow-sm">
                            </div>
                          </div>
                          <div className="w-1/2 bg-[#2C2C2C] p-2 flex flex-col gap-1.5">
                            <div className="flex justify-end">
                              <div className="w-8 h-2.5 bg-[#404040] rounded-full"></div>
                            </div>
                            <div className="mt-auto h-6 w-[120%] -ml-4 flex items-center justify-end px-1 z-0">
                              <div className="w-2 h-2 bg-[#D97757] rounded-full translate-x-3"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`text-[15px] ${theme === opt.value ? 'text-claude-text font-medium' : 'text-claude-textSecondary'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Font - kept for feature parity even if not in screenshot */}
            <div>
              <label className="block text-[13px] font-medium text-claude-textSecondary mb-2">聊天字体</label>
              <div className="flex gap-3">
                {([
                  { value: 'default', label: '默认', sample: 'Aa', font: 'font-serif-claude' },
                  { value: 'sans', label: 'Sans', sample: 'Aa', font: 'font-sans' },
                  { value: 'system', label: '系统', sample: 'Aa', font: 'font-system' }, // approximations for preview
                  { value: 'dyslexic', label: '阅读障碍', sample: 'Aa', font: 'font-serif' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => applyFont(opt.value)}
                    className={`
                      w-32 flex flex-col items-center gap-2 py-3 px-2 rounded-lg border transition-all
                      ${chatFont === opt.value
                        ? 'border-[#3b82f6]/80 scale-[1.02] bg-claude-input text-claude-text shadow-sm'
                        : 'border-claude-border bg-claude-input hover:border-[#CCC] text-claude-textSecondary hover:text-claude-text'
                      }
                    `}
                  >
                    <span className={`text-[20px] leading-none mb-1 ${opt.font}`}>
                      {opt.sample}
                    </span>
                    <span className={`text-[13px] ${chatFont === opt.value ? 'font-medium' : ''}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-claude-border" />

        {/* About Section */}
        <section>
          <h3 className="text-[16px] font-semibold text-claude-text mb-3">关于</h3>
          <div className="flex items-center justify-between py-2">
            <span className="text-[14px] text-claude-textSecondary">当前版本</span>
            <span className="text-[14px] font-mono text-claude-text">v{__APP_VERSION__}</span>
          </div>
        </section>
      </div>
    );
  }
}

export default SettingsPage;

