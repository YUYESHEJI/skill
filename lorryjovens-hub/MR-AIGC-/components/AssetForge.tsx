import React, { useState, useRef } from 'react';
import { Box, Code, Cpu, Layers, Hexagon, Upload, Image as ImageIcon, FileCode, Square, Circle, Cuboid, Move, MousePointer2, Heart, Languages, Loader2 } from 'lucide-react';
import { generateAssetSpecs, fileToGenerativePart, generate3DModel, translateText } from '../services/geminiService';
import { GeneratedAsset, AppLanguage } from '../types';
import { UI_TRANSLATIONS } from '../constants';
import SimpleObjViewer from './SimpleObjViewer';

interface AssetForgeProps {
    language: AppLanguage;
}

const AssetForge: React.FC<AssetForgeProps> = ({ language }) => {
  const t = UI_TRANSLATIONS[language];
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState<GeneratedAsset | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const runGeneration = async (text: string, img: File | null) => {
    setLoading(true);
    setAsset(null);
    try {
      let imagePart = null;
      if (img) {
        imagePart = await fileToGenerativePart(img);
      }
      const data = await generateAssetSpecs(text, imagePart);
      setAsset(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate asset. Check console/API key.");
    } finally {
      setLoading(false);
    }
  };

  const runMeshGeneration = async (text: string) => {
    setLoading(true);
    setAsset(null);
    try {
        // Parallel generation: specs + mesh data
        const [specData, meshData] = await Promise.all([
            generateAssetSpecs(text),
            generate3DModel(text)
        ]);
        
        // Merge them
        setAsset({
            ...specData,
            meshData: meshData,
            type: 'MODEL'
        });

    } catch (error) {
        console.error(error);
        alert("Failed to generate mesh.");
    } finally {
        setLoading(false);
    }
  }

  const handleCreate = () => {
    if(!prompt && !selectedImage) return;
    runGeneration(prompt, selectedImage);
  };

  const handleCreateMesh = () => {
    if(!prompt) return;
    runMeshGeneration(prompt);
  }

  const handlePlaceholder = (type: string) => {
      const p = `A standard ${type} primitive for game prototyping. Optimized geometry with default UVs.`;
      setPrompt(p);
      runMeshGeneration(p); // Directly trigger mesh gen for buttons
  };

  const handleScriptPreset = (label: string, type: string) => {
      const p = `Create a C# game script for ${label}. The script should handle ${type}. Include comments and standard Unity MonoBehaviour structure.`;
      setPrompt(p);
      runGeneration(p, null);
  };
  
  const handleTranslateDescription = async () => {
      if (!asset?.description || isTranslating) return;
      setIsTranslating(true);
      try {
          const hasChinese = /[\u4e00-\u9fa5]/.test(asset.description);
          const target = hasChinese ? 'English' : 'Chinese';
          const result = await translateText(asset.description, target);
          setAsset(prev => prev ? ({...prev, description: result}) : null);
      } catch (e) {
          console.error(e);
      } finally {
          setIsTranslating(false);
      }
  };

  const downloadObj = () => {
      if (!asset?.meshData) return;
      const blob = new Blob([asset.meshData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.name.replace(/\s+/g, '_')}.obj`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">{t.af_title}</h2>
        <p className="text-gray-400">{t.af_subtitle}</p>
      </header>

      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.af_placeholder}
            className="w-full bg-mvx-panel border border-white/20 rounded-full py-4 pl-6 pr-32 text-white focus:outline-none focus:border-mvx-secondary shadow-[0_0_20px_rgba(112,0,255,0.1)] transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          
          <div className="absolute right-2 top-2 flex gap-1">
             <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-full transition-colors ${selectedImage ? 'bg-mvx-success text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                title="Upload Concept Art"
             >
                <Upload size={20} />
             </button>
             <button 
                onClick={handleCreate}
                disabled={loading}
                className="bg-mvx-secondary hover:bg-mvx-secondary/80 text-white rounded-full p-2 transition-colors disabled:opacity-50"
                title={t.af_btn_specs}
             >
                {loading ? <Cpu className="animate-spin" /> : <Code />}
             </button>
             <button 
                onClick={handleCreateMesh}
                disabled={loading}
                className="bg-mvx-accent hover:bg-mvx-accent/80 text-black rounded-full p-2 transition-colors disabled:opacity-50"
                title={t.af_btn_mesh}
             >
                 <Cuboid size={20} />
             </button>
          </div>
        </div>

        {/* Quick Primitives Toolbar */}
        <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
             <span className="text-xs text-gray-500 uppercase tracking-wider self-center mr-2">Quick Primitives:</span>
             <button 
                onClick={() => handlePlaceholder('Cube')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-mvx-panel border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white hover:border-mvx-accent/50 transition-all"
            >
                <Box size={14} className="text-mvx-accent" /> Cube
            </button>
            <button 
                onClick={() => handlePlaceholder('Sphere')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-mvx-panel border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white hover:border-mvx-accent/50 transition-all"
            >
                <Circle size={14} className="text-mvx-accent" /> Sphere
            </button>
            <button 
                onClick={() => handlePlaceholder('Plane')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-mvx-panel border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white hover:border-mvx-accent/50 transition-all"
            >
                <Square size={14} className="text-mvx-accent" /> Plane
            </button>
        </div>
        
        {/* Quick Scripts Toolbar */}
        <div className="flex flex-wrap justify-center gap-3 animate-fade-in mt-3">
             <span className="text-xs text-gray-500 uppercase tracking-wider self-center mr-2">Quick Scripts:</span>
             <button 
                onClick={() => handleScriptPreset('Basic Character Movement', 'WASD movement and jumping')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-mvx-panel border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white hover:border-mvx-secondary/50 transition-all"
            >
                <Move size={14} className="text-mvx-secondary" /> Movement
            </button>
            <button 
                onClick={() => handleScriptPreset('Interaction Handler', 'raycast interactions and event triggering')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-mvx-panel border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white hover:border-mvx-secondary/50 transition-all"
            >
                <MousePointer2 size={14} className="text-mvx-secondary" /> Interaction
            </button>
            <button 
                onClick={() => handleScriptPreset('Health System', 'health points, damage taking, and healing')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-mvx-panel border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white hover:border-mvx-secondary/50 transition-all"
            >
                <Heart size={14} className="text-mvx-secondary" /> Health
            </button>
        </div>
        
        {selectedImage && (
            <div className="relative group mt-2">
                <img src={previewUrl!} className="h-24 rounded-lg border border-white/20" alt="Reference" />
                <button 
                    onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    ×
                </button>
            </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 animate-pulse">
          <Hexagon className="w-16 h-16 text-mvx-secondary mb-4 animate-spin" />
          <p className="text-mvx-secondary font-mono text-sm">ANALYZING GEOMETRY & TEXTURES...</p>
        </div>
      )}

      {asset && (
        <div className="bg-mvx-panel border border-mvx-secondary/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(112,0,255,0.15)] animate-fade-in relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-mvx-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-mvx-secondary/20 text-mvx-secondary px-3 py-1 rounded text-xs font-bold tracking-wider uppercase">
                  {asset.type}
                </span>
                <span className="text-gray-500 text-xs font-mono">ID: {asset.id || 'GEN-X99'}</span>
              </div>
              
              <h3 className="text-4xl font-bold text-white mb-4">{asset.name}</h3>
              <div className="relative group">
                <p className="text-gray-300 leading-relaxed mb-6 border-l-2 border-white/10 pl-4">
                    {asset.description}
                </p>
                <button 
                    onClick={handleTranslateDescription}
                    disabled={isTranslating}
                    className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-black/50 hover:bg-black/80 text-mvx-accent px-2 py-1 rounded flex items-center gap-1"
                >
                    {isTranslating ? <Loader2 size={10} className="animate-spin" /> : <Languages size={10} />} {t.translate}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                  <div className="text-gray-500 text-xs uppercase mb-1 flex items-center gap-2">
                    <Layers size={12} /> {asset.type === 'SCRIPT' ? 'Lines of Code' : 'Poly Count'}
                  </div>
                  <div className="text-xl font-mono text-white">
                    {asset.type === 'SCRIPT' 
                      ? (asset.scriptContent?.split('\n').length || 'N/A') 
                      : (asset.polyCount?.toLocaleString() || 'N/A')}
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                  <div className="text-gray-500 text-xs uppercase mb-1 flex items-center gap-2">
                    <Box size={12} /> {asset.type === 'SCRIPT' ? 'Language' : 'Texture Res'}
                  </div>
                  <div className="text-xl font-mono text-white">
                    {asset.type === 'SCRIPT' ? 'Lua / C#' : (asset.textureResolution || 'N/A')}
                  </div>
                </div>
              </div>

              {/* Mesh Download Button */}
              {asset.meshData && (
                  <button 
                    onClick={downloadObj}
                    className="mt-6 w-full py-3 bg-mvx-accent hover:bg-mvx-accent/90 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                      <Cuboid size={18} /> Download .OBJ Model
                  </button>
              )}
            </div>

            <div className="flex flex-col justify-center items-center bg-black/30 rounded-xl border border-white/5 p-6 h-full min-h-[300px]">
               {/* Content Preview */}
               {asset.type === 'SCRIPT' && asset.scriptContent ? (
                  <div className="w-full h-full max-h-[400px] overflow-auto bg-gray-900 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mb-2 border-b border-white/5 pb-2">
                        <FileCode size={14} /> GENERATED SCRIPT
                    </div>
                    <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
                        {asset.scriptContent}
                    </pre>
                  </div>
               ) : asset.meshData ? (
                   <div className="w-full h-full min-h-[350px] bg-gray-900 rounded-lg overflow-hidden relative border border-white/10 group">
                        <SimpleObjViewer objData={asset.meshData} />
                        <div className="absolute top-4 left-4 text-xs font-mono text-mvx-accent bg-black/60 px-2 py-1 rounded backdrop-blur-sm pointer-events-none border border-mvx-accent/20">
                            3D PREVIEW (DRAG TO ROTATE)
                        </div>
                        <div className="absolute bottom-4 right-4 text-[10px] text-gray-500 font-mono text-right pointer-events-none">
                            {asset.polyCount ? `${asset.polyCount} POLYS` : 'PROCEDURAL MESH'} <br/>
                            {(asset.meshData.length / 1024).toFixed(1)} KB
                        </div>
                   </div>
               ) : (
                  /* Visual placeholder for non-scripts */
                  <div className="w-full aspect-square border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center relative group">
                      <div className="absolute inset-0 bg-mvx-secondary/5 group-hover:bg-mvx-secondary/10 transition-colors" />
                      {selectedImage ? (
                          <img src={previewUrl!} className="w-full h-full object-cover rounded opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                      ) : (
                          <Box className="w-24 h-24 text-gray-700 group-hover:text-mvx-secondary transition-colors duration-500" />
                      )}
                      <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono">
                          {selectedImage ? 'ANALYSIS COMPLETE' : 'PREVIEW UNAVAILABLE'}
                      </div>
                  </div>
               )}
               
               <div className="w-full mt-4">
                 <div className="flex justify-between text-xs text-gray-400 mb-1">
                   <span>AI Confidence</span>
                   <span>{(asset.aiConfidence * 100).toFixed(0)}%</span>
                 </div>
                 <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-gradient-to-r from-mvx-secondary to-mvx-accent" 
                     style={{ width: `${asset.aiConfidence * 100}%` }}
                   />
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetForge;