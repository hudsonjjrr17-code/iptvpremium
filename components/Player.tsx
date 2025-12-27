
import React, { useEffect, useState } from 'react';
import { Channel } from '../types';
import { X, Maximize2, Volume2, Settings, Shield, Info } from 'lucide-react';

interface PlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

const Player: React.FC<PlayerProps> = ({ channel, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (channel) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [channel]);

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in zoom-in-95 duration-500">
      {/* Top Bar */}
      <div className="h-20 flex items-center justify-between px-8 border-b border-zinc-900 bg-black/80 backdrop-blur-2xl">
        <div className="flex items-center gap-5">
          <img src={channel.logo} alt="" className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shadow-xl" />
          <div>
            <h2 className="font-black text-xl text-white uppercase tracking-tight leading-none mb-1">{channel.name}</h2>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">TRANSMISSÃO AO VIVO</span>
              </span>
              <span className="text-[10px] text-zinc-700 font-bold uppercase">• {channel.category} • ULTRA HD</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-zinc-900 hover:bg-red-600 rounded-full transition-all group"
        >
          <X size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative group flex items-center justify-center bg-black overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-red-600/20 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
                <p className="text-white font-black uppercase tracking-[0.4em] mb-2">AUTENTICANDO</p>
                <p className="text-zinc-600 text-xs font-bold uppercase">Conexão Segura IPTV Plus</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative bg-zinc-950">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none z-10" />
             
             {/* Simulação de Video */}
             <div className="w-full h-full flex items-center justify-center">
                <div className="text-center animate-pulse">
                    <Info size={48} className="text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-800 font-black uppercase tracking-widest">Sinal de Vídeo Recebido</p>
                </div>
             </div>
             
             {/* Player Overlay Controls */}
             <div className="absolute bottom-0 inset-x-0 p-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                <div className="flex items-center gap-8">
                    <button className="text-white hover:text-red-600 transition-colors"><Volume2 size={28} /></button>
                    <div className="flex flex-col gap-2 w-80">
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-[95%] bg-red-600 rounded-full shadow-lg shadow-red-600/50" />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">ESTABILIDADE: 99.9%</span>
                            <span className="text-[10px] text-red-600 font-black uppercase tracking-widest">PRO FEED</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-600 rounded-xl border border-red-500/50 shadow-lg shadow-red-600/20">
                        <Shield size={16} className="text-white" />
                        <span className="text-xs font-black uppercase tracking-widest">CRIPTOGRAFADO</span>
                    </div>
                    <button className="text-white hover:text-red-600 transition-all hover:scale-110"><Settings size={26} /></button>
                    <button className="text-white hover:text-red-600 transition-all hover:scale-110"><Maximize2 size={26} /></button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
