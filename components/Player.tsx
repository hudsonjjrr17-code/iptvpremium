
import React, { useEffect, useState } from 'react';
import { Channel } from '../types';
import { X, Maximize2, Volume2, Settings, Shield, Info, Loader2, Play } from 'lucide-react';

interface PlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

const Player: React.FC<PlayerProps> = ({ channel, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (channel) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [channel]);

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
      <div className="h-16 md:h-20 flex items-center justify-between px-6 md:px-8 border-b border-zinc-900 bg-black/90 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-zinc-900">
            <img src={channel.logo} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="max-w-[200px] md:max-w-md">
            <h2 className="font-black text-base md:text-xl text-white uppercase truncate">{channel.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-red-600 font-black uppercase">SINCRONIZADO • STREAM PREMIUM</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 md:p-3 bg-zinc-900 hover:bg-red-600 rounded-full transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-red-600 animate-spin" size={40} />
            <p className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Iniciando Fluxo de Dados...</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative bg-zinc-950">
             <div className="text-center">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                    <Play size={32} className="text-zinc-700 fill-current" />
                </div>
                <p className="text-zinc-700 font-black uppercase tracking-widest text-xs">Sinal Estabilizado</p>
                <p className="text-zinc-800 text-[10px] mt-2 font-bold">{channel.url.substring(0, 40)}...</p>
             </div>
             
             <div className="absolute bottom-10 inset-x-0 px-10 flex justify-between items-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 flex items-center gap-4 pointer-events-auto">
                    <Volume2 size={18} className="text-zinc-400" />
                    <div className="w-32 h-1 bg-zinc-800 rounded-full">
                        <div className="w-3/4 h-full bg-red-600 rounded-full" />
                    </div>
                </div>
                <div className="flex gap-4 pointer-events-auto">
                    <button className="p-3 bg-black/60 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"><Settings size={20} /></button>
                    <button className="p-3 bg-black/60 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"><Maximize2 size={20} /></button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
