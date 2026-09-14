import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Radio, Volume2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import { GEMINI_MODEL_LIVE } from '../constants';

// Simple PCM Encoder/Decoder utils
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const LiveNPC: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Playback State
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session Ref
  const sessionRef = useRef<Promise<any> | null>(null);
  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY }));
  
  const startSession = async () => {
    try {
        setStatus("Initializing Audio...");
        // 1. Setup Audio
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass({ sampleRate: 16000 }); // Input rate 16k
        const outputCtx = new AudioContextClass({ sampleRate: 24000 }); // Output rate 24k
        
        audioContextRef.current = outputCtx; // Store output ctx for playback
        nextStartTimeRef.current = 0;
        sourceNodesRef.current.clear();
        
        // Input Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        setStatus("Connecting to Gemini Live...");
        
        const ai = aiRef.current;
        
        // 2. Connect Session
        const sessionPromise = ai.live.connect({
            model: GEMINI_MODEL_LIVE,
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
                systemInstruction: "You are a sentient AI hologram named 'Nexus' in a futuristic game engine. You help the user build worlds. Be concise, robotic but friendly.",
            },
            callbacks: {
                onopen: () => {
                    setStatus("Connected - Listening");
                    setIsActive(true);
                    
                    // Start Streaming Input
                    const source = ctx.createMediaStreamSource(stream);
                    const processor = ctx.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        // Convert to PCM Int16
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const b64Data = encode(new Uint8Array(int16.buffer));
                        
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                media: {
                                    mimeType: 'audio/pcm;rate=16000',
                                    data: b64Data
                                }
                            });
                        });
                    };
                    
                    source.connect(processor);
                    processor.connect(ctx.destination);
                    
                    sourceRef.current = source;
                    processorRef.current = processor;
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const serverContent = msg.serverContent;
                    
                    // Handle Interruption: Clear queue and stop playing
                    if (serverContent?.interrupted) {
                        console.log("Audio Interrupted");
                        for (const node of sourceNodesRef.current) {
                            try { node.stop(); } catch(e) {}
                        }
                        sourceNodesRef.current.clear();
                        nextStartTimeRef.current = 0;
                        return;
                    }

                    const data = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (data) {
                        // Decode
                        const bytes = decode(data);
                        
                        // Convert Int16 bytes to Float32 for Web Audio
                        const dataInt16 = new Int16Array(bytes.buffer);
                        const frameCount = dataInt16.length;
                        const buffer = outputCtx.createBuffer(1, frameCount, 24000);
                        const channelData = buffer.getChannelData(0);
                        for(let i=0; i<frameCount; i++) {
                            channelData[i] = dataInt16[i] / 32768.0;
                        }
                        
                        const src = outputCtx.createBufferSource();
                        src.buffer = buffer;
                        src.connect(outputCtx.destination);
                        
                        // Smart Scheduling
                        // Ensure we don't schedule in the past.
                        const now = outputCtx.currentTime;
                        
                        // If the next start time is behind current time (underrun), reset it to now + buffer
                        if (nextStartTimeRef.current < now) {
                            nextStartTimeRef.current = now + 0.05; // 50ms buffer to prevent clicks
                        }
                        
                        src.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += buffer.duration;
                        
                        // Track sources for interruption handling
                        sourceNodesRef.current.add(src);
                        src.onended = () => {
                            sourceNodesRef.current.delete(src);
                        };
                    }
                },
                onclose: () => {
                    setStatus("Disconnected");
                    setIsActive(false);
                },
                onerror: (err: any) => {
                    console.error(err);
                    setStatus("Error");
                }
            }
        });
        
        sessionRef.current = sessionPromise;
        
    } catch (e: any) {
        console.error(e);
        setStatus("Failed: " + e.message);
    }
  };

  const stopSession = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    
    // Stop any currently playing audio
    for (const node of sourceNodesRef.current) {
        try { node.stop(); } catch(e) {}
    }
    sourceNodesRef.current.clear();

    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsActive(false);
    setStatus("Disconnected");
    
    // Attempt to close session if valid
    if (sessionRef.current) {
        sessionRef.current.then(s => {
            try { s.close(); } catch(e){}
        });
    }
    sessionRef.current = null;
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center relative overflow-hidden bg-black rounded-3xl border-4 border-mvx-panel">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2676&auto=format&fit=crop')] bg-cover opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-8">
            <div className={`w-64 h-64 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'border-mvx-accent shadow-[0_0_50px_#00f0ff]' : 'border-gray-800'}`}>
                <div className={`w-48 h-48 rounded-full bg-mvx-panel flex items-center justify-center relative overflow-hidden ${isActive ? 'animate-pulse' : ''}`}>
                    <div className="absolute inset-0 bg-mvx-accent/20"></div>
                    <Radio className={`w-24 h-24 ${isActive ? 'text-mvx-accent' : 'text-gray-700'}`} />
                </div>
            </div>
            
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-wider">NEXUS AI</h2>
                <p className="font-mono text-mvx-accent">{status}</p>
            </div>
            
            <button 
                onClick={isActive ? stopSession : startSession}
                className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all ${isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-mvx-accent hover:bg-mvx-accent/90 text-black'}`}
            >
                {isActive ? (
                    <><MicOff /> Terminate Uplink</>
                ) : (
                    <><Mic /> Establish Uplink</>
                )}
            </button>
            
            {isActive && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-4">
                    <Volume2 size={12} className="animate-pulse" /> Live API Protocol Active
                </div>
            )}
        </div>
    </div>
  );
};

export default LiveNPC;