import React, { useEffect, useState, useRef } from 'react';
import { Activity, Wind, Move, Layers, Upload, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_PHYSICS_DATA, UI_TRANSLATIONS } from '../constants';
import { analyzePhysicsLog } from '../services/geminiService';
import { AppLanguage } from '../types';

interface PhysicsLabProps {
    language: AppLanguage;
}

const PhysicsLab: React.FC<PhysicsLabProps> = ({ language }) => {
    const t = UI_TRANSLATIONS[language];
    const [analysis, setAnalysis] = useState<string>("Initializing AI Physics Observer...");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const manualOverride = useRef(false); // Track if user initiated an analysis

    useEffect(() => {
        // Simulate an initial analysis
        const timer = setTimeout(async () => {
            // Only run simulation if user hasn't started their own analysis
            if (!manualOverride.current) {
                const result = await analyzePhysicsLog("Collision load spiking at T-5s. Active entities > 1200.");
                // Double check inside the async continuation to prevent race conditions
                if (!manualOverride.current) {
                    setAnalysis(result);
                }
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        manualOverride.current = true; // Stop simulation from overwriting
        setIsAnalyzing(true);
        setAnalysis(""); // Clear previous text

        try {
            const text = await file.text();
            // In a real app, you might want to truncate text if it's too large for the context window.
            const result = await analyzePhysicsLog(text);
            setAnalysis(result);
        } catch (error) {
            console.error("Analysis error:", error);
            setAnalysis("Error analyzing log file. Please check console.");
        } finally {
            setIsAnalyzing(false);
            // Reset input so the same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{t.phy_title}</h2>
          <p className="text-gray-400">{t.phy_subtitle}</p>
        </div>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".log,.txt,.json,.csv" 
                className="hidden" 
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-mvx-panel border border-white/20 text-white rounded hover:bg-white/10 transition-colors text-sm font-mono flex items-center gap-2"
            >
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {t.phy_upload}
            </button>
            <button className="px-4 py-2 bg-mvx-success/10 text-mvx-success border border-mvx-success/20 rounded hover:bg-mvx-success/20 transition-colors text-sm font-mono">
                {t.phy_sim_active}
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-mvx-panel border border-white/5 rounded-xl p-6">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Rigid Body Collision Load</h3>
           <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_PHYSICS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1123', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="collisionLoad" stroke="#00ff9d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="physicsThreadTime" stroke="#7000ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="bg-mvx-panel border border-white/5 rounded-xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className={`w-4 h-4 text-mvx-accent ${isAnalyzing ? 'animate-spin' : ''}`} />
                {t.phy_analysis_title}
            </h3>
            <div className="flex-1 bg-black/40 rounded-lg p-4 text-sm font-mono text-gray-300 leading-relaxed overflow-y-auto border border-white/5 min-h-[150px] relative">
                {isAnalyzing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-mvx-accent gap-2">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span>Processing Log Data...</span>
                    </div>
                ) : (
                    analysis
                )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded text-center">
                    <div className="text-xs text-gray-500">Gravitational Constant</div>
                    <div className="text-white font-mono">9.81 m/s²</div>
                </div>
                <div className="bg-white/5 p-3 rounded text-center">
                    <div className="text-xs text-gray-500">Friction Coeff</div>
                    <div className="text-white font-mono">0.42</div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-mvx-panel border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2 text-mvx-accent">
                <Wind size={20} />
                <h4 className="font-bold">Fluid Dynamics</h4>
            </div>
            <p className="text-xs text-gray-500">Simulating volumetric fog and water displacement.</p>
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-mvx-accent w-3/4 animate-pulse"></div>
            </div>
         </div>

         <div className="bg-mvx-panel border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2 text-mvx-secondary">
                <Move size={20} />
                <h4 className="font-bold">Kinematics</h4>
            </div>
            <p className="text-xs text-gray-500">Inverse kinematics solver for character animation.</p>
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-mvx-secondary w-1/2"></div>
            </div>
         </div>

         <div className="bg-mvx-panel border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2 text-mvx-warning">
                <Layers size={20} />
                <h4 className="font-bold">Soft Bodies</h4>
            </div>
            <p className="text-xs text-gray-500">Cloth and tissue simulation active.</p>
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-mvx-warning w-1/4"></div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PhysicsLab;