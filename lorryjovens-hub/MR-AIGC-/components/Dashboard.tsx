import React from 'react';
import { Users, Server, Zap, HardDrive } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_PHYSICS_DATA, UI_TRANSLATIONS } from '../constants';
import { AppLanguage } from '../types';

interface DashboardProps {
    language: AppLanguage;
}

const StatCard: React.FC<{ title: string; value: string; sub: string; icon: React.FC<any>; color: string }> = ({ title, value, sub, icon: Icon, color }) => (
  <div className="bg-mvx-panel border border-white/5 rounded-xl p-6 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-${color}-500/20`} />
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-mono font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500/20 text-${color}-400`}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-gray-500 text-xs font-mono">{sub}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const t = UI_TRANSLATIONS[language];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t.dash_title}</h2>
        <p className="text-gray-400">{t.dash_subtitle}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t.dash_active_users} value="12,405" sub="+14% from last hour" icon={Users} color="mvx-accent" />
        <StatCard title={t.dash_ai_ops} value="842/s" sub="Gemini 3 Pro Inference" icon={Zap} color="mvx-secondary" />
        <StatCard title={t.dash_physics_load} value="42%" sub="Neural Physics Engine" icon={Server} color="mvx-success" />
        <StatCard title={t.dash_storage} value="8.4 PB" sub="Procedural Assets" icon={HardDrive} color="mvx-warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-mvx-panel border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-mvx-accent" />
            {t.dash_physics_load} (Real-time)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PHYSICS_DATA}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#666" fontSize={12} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1123', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="collisionLoad" stroke="#00f0ff" fillOpacity={1} fill="url(#colorLoad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-mvx-panel border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t.dash_notifications}</h3>
          <div className="space-y-4">
            {[
              { time: '10:42 AM', msg: 'Gemini 3 Pro model updated to stable-v3.1', type: 'info' },
              { time: '10:38 AM', msg: 'Texture compression warning in Sector 7G', type: 'warn' },
              { time: '10:15 AM', msg: 'New procedural biome generation complete', type: 'success' },
              { time: '09:55 AM', msg: 'MR Device connected: Vision Pro', type: 'info' },
            ].map((note, idx) => (
              <div key={idx} className="flex gap-3 pb-3 border-b border-white/5 last:border-0">
                <div className="text-xs font-mono text-gray-500 whitespace-nowrap pt-1">{note.time}</div>
                <div>
                  <p className="text-sm text-gray-300">{note.msg}</p>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    note.type === 'info' ? 'bg-blue-900/50 text-blue-400' :
                    note.type === 'warn' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-green-900/50 text-green-400'
                  }`}>{note.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;