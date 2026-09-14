import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { generateScript, generateVeoVideo, checkVeoKeySelection, openVeoKeySelection } from '../services/geminiService';

interface AIPanelProps {
  onAddGeneratedVideo: (blobUrl: string) => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ onAddGeneratedVideo }) => {
  const [activeTab, setActiveTab] = useState<'script' | 'veo'>('script');
  
  // Script State
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptResult, setScriptResult] = useState('');
  const [isScriptLoading, setIsScriptLoading] = useState(false);

  // Veo State
  const [veoPrompt, setVeoPrompt] = useState('');
  const [isVeoLoading, setIsVeoLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [veoError, setVeoError] = useState<string | null>(null);

  useEffect(() => {
    // Check key status on mount
    checkVeoKeySelection().then(setHasKey);
  }, []);

  const handleGenerateScript = async () => {
    if (!scriptTopic.trim()) return;
    setIsScriptLoading(true);
    try {
      const result = await generateScript(scriptTopic);
      setScriptResult(result);
    } catch (e) {
      setScriptResult("Error generating script. Please try again.");
    } finally {
      setIsScriptLoading(false);
    }
  };

  const handleKeySelection = async () => {
    try {
      await openVeoKeySelection();
      // Assume success after dialog interaction, re-verify
      setHasKey(true);
    } catch (e) {
      console.error(e);
      setVeoError("Failed to select API key.");
    }
  };

  const handleGenerateVeo = async () => {
    if (!veoPrompt.trim()) return;
    setIsVeoLoading(true);
    setVeoError(null);
    try {
      // Re-verify key before generation as a safeguard
      if (!hasKey) {
        await handleKeySelection();
      }
      
      const videoUrl = await generateVeoVideo(veoPrompt);
      onAddGeneratedVideo(videoUrl);
      setVeoPrompt(''); // clear prompt on success
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found") || error.message?.includes("404")) {
        setHasKey(false);
        setVeoError("API Key not found or invalid. Please select a Paid Project key.");
      } else {
        setVeoError("Failed to generate video. Ensure your quota allows Veo generation.");
      }
    } finally {
      setIsVeoLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 text-sm">
      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('script')}
          className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 ${activeTab === 'script' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Icons.Type size={16} /> Script
        </button>
        <button 
          onClick={() => setActiveTab('veo')}
          className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 ${activeTab === 'veo' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Icons.Sparkles size={16} /> Veo Video
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'script' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Video Topic</label>
              <textarea
                value={scriptTopic}
                onChange={(e) => setScriptTopic(e.target.value)}
                placeholder="e.g. A cyberpunk city introduction..."
                className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-cyan-500 focus:outline-none h-24 resize-none"
              />
            </div>
            <button
              onClick={handleGenerateScript}
              disabled={isScriptLoading || !scriptTopic}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 rounded flex items-center justify-center gap-2 transition-all"
            >
              {isScriptLoading ? <Icons.Wand2 className="animate-spin" size={16}/> : <Icons.Wand2 size={16}/>}
              Generate Script
            </button>
            
            {scriptResult && (
              <div className="mt-4 bg-gray-800 p-3 rounded border border-gray-700">
                <h3 className="text-gray-300 font-bold mb-2">Generated Plan:</h3>
                <pre className="whitespace-pre-wrap text-gray-400 text-xs font-mono">{scriptResult}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30 text-xs text-purple-200">
              <p className="mb-2"><strong>Veo 3.1</strong> creates high-quality AI videos. This feature requires a paid GCP project API key.</p>
              {!hasKey ? (
                <button 
                  onClick={handleKeySelection}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded w-full mt-1"
                >
                  Select Paid API Key
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Key Active
                </div>
              )}
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block mt-2 underline opacity-70 hover:opacity-100">
                Billing Documentation
              </a>
            </div>

            {hasKey && (
              <>
                <div>
                  <label className="block text-gray-400 mb-2">Video Prompt</label>
                  <textarea
                    value={veoPrompt}
                    onChange={(e) => setVeoPrompt(e.target.value)}
                    placeholder="e.g. A neon hologram of a cat driving at top speed"
                    className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-purple-500 focus:outline-none h-24 resize-none"
                  />
                </div>
                <button
                  onClick={handleGenerateVeo}
                  disabled={isVeoLoading || !veoPrompt}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 rounded flex items-center justify-center gap-2 transition-all"
                >
                   {isVeoLoading ? <Icons.Wand2 className="animate-spin" size={16}/> : <Icons.Clapperboard size={16}/>}
                   Generate Video (Veo)
                </button>
              </>
            )}

            {veoError && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-xs">
                {veoError}
                {veoError.includes("API Key") && (
                   <button onClick={handleKeySelection} className="underline ml-2">Retry Selection</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};