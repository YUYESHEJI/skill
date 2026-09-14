


import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { audioService } from '../services/audioService';
import { AudioData } from '../types';

interface FileUploadProps {
  onUpload: (newItems: AudioData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [isDecoding, setIsDecoding] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsDecoding(true);
    const newItems: AudioData[] = [];
    
    // Fix: Explicitly cast Array.from(files) to File[] to ensure the 'file' variable is typed correctly in the loop.
    for (const file of Array.from(files) as File[]) {
      try {
        const buffer = await audioService.loadAudio(file);
        newItems.push({
          buffer,
          name: file.name.replace(/\.[^/.]+$/, "") // Remove extension for cleaner display
        });
      } catch (err) {
        console.error(`Failed to decode ${file.name}:`, err);
      }
    }

    if (newItems.length > 0) {
      onUpload(newItems);
    }
    
    setIsDecoding(false);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  return (
    <div className="mb-6">
      <label className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer group ${isDecoding ? 'border-cyan-500/50 bg-cyan-500/5 animate-pulse' : 'border-white/10 hover:border-cyan-500/50 hover:bg-white/5'}`}>
        <input 
          type="file" 
          multiple 
          accept=".mp3,.wav,audio/mpeg,audio/wav" 
          onChange={handleFileChange} 
          className="hidden" 
          disabled={isDecoding}
        />
        <div className="flex flex-col items-center gap-2 text-white/40 group-hover:text-cyan-400">
          {isDecoding ? (
            <>
              <Loader2 size={24} className="animate-spin text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">正在解析音频...</span>
            </>
          ) : (
            <>
              <Upload size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest">添加 MP3 / WAV 音乐</span>
            </>
          )}
        </div>
      </label>
    </div>
  );
};

export default FileUpload;