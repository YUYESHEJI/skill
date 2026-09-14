import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Loader2, Sparkles, Image as ImageIcon, Video, Search, MapPin, Languages } from 'lucide-react';
import { streamWorldGeneration, generateWorldImage, generateWorldVideo, translateText } from '../services/geminiService';
import { SAMPLE_PROMPTS, UI_TRANSLATIONS } from '../constants';
import { AppLanguage } from '../types';
import ReactMarkdown from 'react-markdown';

type Mode = 'LORE' | 'IMAGE' | 'VIDEO';

interface WorldBuilderProps {
    language: AppLanguage;
}

const WorldBuilder: React.FC<WorldBuilderProps> = ({ language }) => {
  const t = UI_TRANSLATIONS[language];
  const [mode, setMode] = useState<Mode>('LORE');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  
  // Options
  const [useGrounding, setUseGrounding] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imgSize, setImgSize] = useState('1K');
  
  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedMediaUrl(null);
    if (mode === 'LORE') setOutput('');
    
    try {
      if (mode === 'LORE') {
        await streamWorldGeneration(prompt, useGrounding, (chunk) => {
          setOutput(prev => prev + chunk); 
        });
      } else if (mode === 'IMAGE') {
        const url = await generateWorldImage(prompt, imgSize, aspectRatio);
        setGeneratedMediaUrl(url);
      } else if (mode === 'VIDEO') {
        // Veo Check
        // @ts-ignore
        if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
            // @ts-ignore
           await window.aistudio.openSelectKey();
        }
        
        const url = await generateWorldVideo(prompt, aspectRatio as '16:9' | '9:16');
        setGeneratedMediaUrl(url);
      }
    } catch (e: any) {
        if (mode === 'LORE') setOutput(`Error: ${e.message}`);
        else alert(`Generation Failed: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleTranslate = async () => {
      if (!output || isTranslating) return;
      setIsTranslating(true);
      try {
        // Simple toggle logic: If it contains chinese characters, translate to English, else Chinese
        const hasChinese = /[\u4e00-\u9fa5]/.test(output);
        const target = hasChinese ? 'English' : 'Chinese';
        const result = await translateText(output, target);
        setOutput(result);
      } catch (e) {
          console.error(e);
      } finally {
          setIsTranslating(false);
      }
  };

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6">
      {/* Left Panel: Input */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="bg-mvx-panel border border-white/5 p-6 rounded-xl flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="text-mvx-accent" />
            {t.wb_title}
          </h2>

          {/* Mode Switcher */}
          <div className="flex bg-black/40 p-1 rounded-lg mb-6">
             <button 
                onClick={() => setMode('LORE')} 
                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'LORE' ? 'bg-mvx-accent text-black' : 'text-gray-400 hover:text-white'}`}
             >
                <Globe size={14} /> {t.wb_lore}
             </button>
             <button 
                onClick={() => setMode('IMAGE')} 
                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'IMAGE' ? 'bg-mvx-accent text-black' : 'text-gray-400 hover:text-white'}`}
             >
                <ImageIcon size={14} /> {t.wb_concept}
             </button>
             <button 
                onClick={() => setMode('VIDEO')} 
                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'VIDEO' ? 'bg-mvx-accent text-black' : 'text-gray-400 hover:text-white'}`}
             >
                <Video size={14} /> {t.wb_veo}
             </button>
          </div>

          <div className="flex-1 space-y-4">
            <label className="block text-xs font-mono text-gray-500 uppercase">
                {mode === 'LORE' ? t.wb_prompt_lore : mode === 'IMAGE' ? t.wb_prompt_visual : t.wb_prompt_cine}
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-4 text-white resize-none focus:border-mvx-accent focus:outline-none transition-colors"
              placeholder={mode === 'LORE' ? "Describe the history and physics..." : "A cyberpunk street with neon rain..."}
            />

            {/* Configs based on mode */}
            {mode === 'LORE' && (
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg cursor-pointer" onClick={() => setUseGrounding(!useGrounding)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${useGrounding ? 'bg-mvx-accent border-mvx-accent' : 'border-gray-500'}`}>
                        {useGrounding && <div className="w-2 h-2 bg-black rounded-sm" />}
                    </div>
                    <span className="text-sm text-gray-300 flex items-center gap-2">
                        {t.wb_grounding} <span className="text-xs text-gray-500">(Google Search/Maps)</span>
                    </span>
                    {(useGrounding) && <div className="flex gap-1 ml-auto"><Search size={14} className="text-mvx-accent"/><MapPin size={14} className="text-mvx-accent"/></div>}
                </div>
            )}

            {(mode === 'IMAGE' || mode === 'VIDEO') && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Aspect Ratio</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-2 text-sm text-white">
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                            {mode === 'IMAGE' && <option value="1:1">1:1 (Square)</option>}
                            {mode === 'IMAGE' && <option value="4:3">4:3</option>}
                        </select>
                    </div>
                    {mode === 'IMAGE' && (
                        <div>
                            <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Resolution</label>
                            <select value={imgSize} onChange={(e) => setImgSize(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-2 text-sm text-white">
                                <option value="1K">1K</option>
                                <option value="2K">2K</option>
                                <option value="4K">4K</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

            <div>
              <p className="text-xs font-mono text-gray-500 uppercase mb-2">Sample Prompts</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPrompt(p)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-full transition-colors text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className={`mt-6 w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${
              isGenerating 
                ? 'bg-mvx-accent/20 text-mvx-accent cursor-wait' 
                : 'bg-mvx-accent hover:bg-mvx-accent/90 text-black'
            }`}
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isGenerating ? t.wb_generating : t.wb_generate}
          </button>
        </div>
      </div>

      {/* Right Panel: Output */}
      <div className="flex-1 bg-mvx-panel border border-white/5 p-6 rounded-xl flex flex-col overflow-hidden relative justify-center items-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mvx-accent to-transparent opacity-50" />
        
        {mode === 'LORE' && (
             <>
                 {output && (
                     <div className="absolute top-4 right-4 z-20">
                         <button 
                            onClick={handleTranslate}
                            disabled={isTranslating}
                            className="flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 border border-white/10 rounded-full text-xs font-mono text-mvx-accent backdrop-blur-sm transition-all"
                         >
                            {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                            {isTranslating ? t.translating : t.translate}
                         </button>
                     </div>
                 )}
                 <div ref={scrollRef} className="w-full h-full overflow-y-auto pr-2 custom-markdown pt-8">
                    {output ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{output}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-600 flex-col gap-3">
                        <Globe className="w-12 h-12 opacity-20" />
                        <p>Awaiting World Lore...</p>
                        </div>
                    )}
                 </div>
             </>
        )}

        {(mode === 'IMAGE' || mode === 'VIDEO') && (
            <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg border border-white/5 relative">
                {generatedMediaUrl ? (
                    mode === 'IMAGE' ? (
                        <img src={generatedMediaUrl} alt="Generated" className="max-w-full max-h-full rounded shadow-2xl" />
                    ) : (
                        <video src={generatedMediaUrl} controls autoPlay loop className="max-w-full max-h-full rounded shadow-2xl" />
                    )
                ) : (
                    <div className="flex flex-col items-center text-gray-600">
                         {isGenerating ? (
                             <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 text-mvx-accent animate-spin" />
                                <p className="text-mvx-accent animate-pulse font-mono text-sm">
                                    {mode === 'VIDEO' ? 'RENDER FARM ACTIVE (VEO)...' : 'DIFFUSION ACTIVE...'}
                                </p>
                             </div>
                         ) : (
                             <>
                                {mode === 'IMAGE' ? <ImageIcon className="w-16 h-16 opacity-20 mb-4" /> : <Video className="w-16 h-16 opacity-20 mb-4" />}
                                <p>Preview Area</p>
                             </>
                         )}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default WorldBuilder;