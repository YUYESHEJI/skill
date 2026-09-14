import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { translateText } from '../services/geminiService';

const Translator: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState<'EN_TO_CN' | 'CN_TO_EN'>('EN_TO_CN');
    const [copied, setCopied] = useState(false);

    const handleTranslate = async () => {
        if (!input.trim()) return;
        setLoading(true);
        const target = direction === 'EN_TO_CN' ? 'Chinese' : 'English';
        const result = await translateText(input, target);
        setOutput(result);
        setLoading(false);
    };

    const handleSwap = () => {
        setDirection(prev => prev === 'EN_TO_CN' ? 'CN_TO_EN' : 'EN_TO_CN');
        setInput(output);
        setOutput(input);
    };

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Languages className="text-mvx-accent" />
                    Neural Localization
                </h2>
                <p className="text-gray-400">Real-time AI translation for game assets and dialogue.</p>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-6">
                {/* Input Side */}
                <div className="flex-1 bg-mvx-panel border border-white/10 rounded-xl p-4 flex flex-col shadow-lg">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                        <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                            {direction === 'EN_TO_CN' ? 'English (Source)' : 'Chinese (Source)'}
                        </span>
                        <div className="h-2 w-2 rounded-full bg-mvx-secondary animate-pulse"></div>
                    </div>
                    <textarea 
                        className="flex-1 bg-transparent resize-none focus:outline-none text-white font-mono text-sm leading-relaxed"
                        placeholder={direction === 'EN_TO_CN' ? "Enter text to translate..." : "请输入要翻译的文本..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                handleTranslate();
                            }
                        }}
                    />
                    <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                        <span>{input.length} chars</span>
                        <span className="text-gray-600">CTRL+ENTER to run</span>
                    </div>
                </div>

                {/* Controls Middle */}
                <div className="flex md:flex-col justify-center items-center gap-4">
                    <button 
                        onClick={handleSwap}
                        className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 hover:border-mvx-accent/50"
                        title="Swap Languages"
                    >
                        <ArrowRightLeft size={20} />
                    </button>
                    <button 
                        onClick={handleTranslate}
                        disabled={loading || !input}
                        className={`p-4 rounded-full transition-all shadow-lg shadow-mvx-accent/20 ${
                            loading 
                            ? 'bg-mvx-panel border border-mvx-accent/30 cursor-wait' 
                            : 'bg-gradient-to-br from-mvx-secondary to-mvx-accent text-black hover:scale-110'
                        }`}
                        title="Translate"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin text-mvx-accent" /> : <Sparkles size={24} />}
                    </button>
                </div>

                {/* Output Side */}
                <div className="flex-1 bg-mvx-panel border border-mvx-accent/20 rounded-xl p-4 flex flex-col shadow-[0_0_30px_rgba(0,240,255,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-mvx-accent/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5 relative z-10">
                        <span className="text-sm font-bold text-mvx-accent uppercase tracking-wider">
                            {direction === 'EN_TO_CN' ? 'Chinese (Target)' : 'English (Target)'}
                        </span>
                        <button 
                            onClick={copyToClipboard}
                            disabled={!output}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto relative z-10">
                        {output ? (
                            <p className="text-white font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                {output}
                            </p>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-700 select-none">
                                <Languages size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">Translation will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Translator;