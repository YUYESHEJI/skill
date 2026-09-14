import React, { useState } from 'react';
import { Scan, Eye, Hand, MousePointer2 } from 'lucide-react';

const MRSimulator: React.FC = () => {
    const [mode, setMode] = useState<'passthrough' | 'immersive'>('passthrough');

    return (
        <div className="h-[calc(100vh-8rem)] bg-black rounded-3xl relative overflow-hidden border-8 border-gray-900 shadow-2xl">
            {/* Background / Environment Simulation */}
            <div className={`absolute inset-0 transition-all duration-1000 ${mode === 'passthrough' ? 'bg-gray-800' : 'bg-mvx-dark'}`}>
                {/* Simulated Room if Passthrough */}
                {mode === 'passthrough' && (
                    <div className="w-full h-full opacity-30 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale mix-blend-overlay"></div>
                )}
                
                {/* Simulated Virtual World */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[800px] h-[800px] border border-mvx-accent/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute w-[600px] h-[600px] border border-mvx-secondary/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                </div>
            </div>

            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 text-mvx-accent text-sm font-mono mb-1">
                            <Scan size={16} /> SPATIAL MAPPING
                        </div>
                        <div className="text-xs text-gray-400">Room Depth: 4.2m</div>
                        <div className="text-xs text-gray-400">Surface Confidence: 98%</div>
                    </div>

                    <div className="flex gap-2 pointer-events-auto">
                        <button 
                            onClick={() => setMode('passthrough')}
                            className={`px-4 py-2 rounded-lg backdrop-blur-md text-sm font-bold border ${mode === 'passthrough' ? 'bg-white/20 border-white text-white' : 'bg-black/40 border-white/10 text-gray-400'}`}
                        >
                            MR PASSTHROUGH
                        </button>
                        <button 
                            onClick={() => setMode('immersive')}
                            className={`px-4 py-2 rounded-lg backdrop-blur-md text-sm font-bold border ${mode === 'immersive' ? 'bg-mvx-secondary/50 border-mvx-secondary text-white' : 'bg-black/40 border-white/10 text-gray-400'}`}
                        >
                            VR IMMERSIVE
                        </button>
                    </div>
                </div>

                {/* Interaction Hands Placeholder */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-32 opacity-50">
                    <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
                        <Hand className="text-white" />
                    </div>
                    <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
                        <Hand className="text-white scale-x-[-1]" />
                    </div>
                </div>

                {/* Eye Tracking Reticle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 border border-white/50 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="absolute top-1/2 left-12 -translate-y-1/2 pointer-events-auto">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-64 transform -rotate-y-12 shadow-2xl">
                    <h3 className="text-white font-bold mb-4">Object Inspector</h3>
                    <div className="space-y-3">
                        <div className="h-2 bg-gray-700 rounded w-full"></div>
                        <div className="h-2 bg-gray-700 rounded w-2/3"></div>
                        <div className="h-2 bg-gray-700 rounded w-5/6"></div>
                    </div>
                    <div className="mt-6 flex justify-between items-center text-xs text-mvx-accent font-mono">
                        <MousePointer2 size={14} /> Gaze Active
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default MRSimulator;