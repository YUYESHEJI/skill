import React, { useRef } from 'react';
import { Asset } from '../types';
import { Icons } from './Icon';

interface AssetLibraryProps {
  assets: Asset[];
  onAddAsset: (file: File) => Promise<void>;
  onDragStart: (e: React.DragEvent, asset: Asset) => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ assets, onAddAsset, onDragStart }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Handle multiple files if needed, currently taking first
      await onAddAsset(e.target.files[0]);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div>
           <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Media Assets</h2>
           <span className="text-[10px] text-gray-500">{assets.length} items</span>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white transition-colors flex items-center gap-2"
          title="Import Media"
        >
          <Icons.Upload size={16} />
          <span className="text-xs font-bold">Import</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="video/*,image/*,audio/*"
          onChange={handleFileChange}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 content-start">
        {assets.length === 0 && (
          <div className="col-span-2 text-center text-gray-500 py-10 flex flex-col items-center">
             <Icons.Film size={32} className="mb-2 opacity-50"/>
             <span className="text-xs">Import videos or images to start</span>
          </div>
        )}
        {assets.map((asset) => (
          <div
            key={asset.id}
            draggable
            onDragStart={(e) => onDragStart(e, asset)}
            className="group relative aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 cursor-grab active:cursor-grabbing transition-all shadow-md"
          >
            {asset.type === 'video' || asset.type === 'image' ? (
              <img 
                src={asset.thumbnail || asset.src} 
                className="w-full h-full object-cover pointer-events-none"
                alt={asset.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                <Icons.Music size={24} />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
              <span className="text-xs text-white truncate w-full font-medium">{asset.name}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                 {asset.tags?.slice(0, 3).map(tag => (
                   <span key={tag} className="text-[9px] bg-cyan-900/80 text-cyan-200 px-1 rounded">{tag}</span>
                 ))}
              </div>
            </div>

            {/* Status Icons */}
            <div className="absolute top-1 right-1 flex flex-col gap-1 items-end">
               <span className="bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white font-mono uppercase">
                  {asset.type}
               </span>
               {asset.uploadStatus === 'processing' && (
                 <Icons.Sparkles size={12} className="text-yellow-400 animate-pulse" />
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};