
import React from 'react';
import { Channel } from '../types';
import { Play, Heart, Star } from 'lucide-react';

interface ChannelGridProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  title: string;
}

const ChannelGrid: React.FC<ChannelGridProps> = ({ channels, onChannelSelect, onToggleFavorite, title }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between border-l-4 border-red-600 pl-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{title}</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Acervo IPTV Plus</p>
        </div>
        <span className="text-zinc-600 text-sm font-black">{channels.length} ITENS</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {channels.map((channel) => (
          <div 
            key={channel.id}
            className="group relative bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-600/10"
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <img 
                src={channel.logo || `https://picsum.photos/seed/${channel.id}/600/800`} 
                alt={channel.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[4px]">
                <button 
                  onClick={() => onChannelSelect(channel)}
                  className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 hover:bg-red-500 hover:scale-110"
                >
                  <Play className="text-white fill-current ml-1" size={28} />
                </button>
              </div>

              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(channel.id);
                }}
                className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-xl transition-all ${
                  channel.isFavorite 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' 
                    : 'bg-black/40 text-white/70 hover:bg-red-600/20'
                }`}
              >
                <Heart size={18} fill={channel.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
              </button>

              <div className="absolute bottom-4 left-4 px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                {channel.category}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-white truncate text-lg group-hover:text-red-600 transition-colors">
                {channel.name}
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-red-500 fill-current" />
                    <span className="text-xs text-zinc-400 font-black uppercase">4.9 HD</span>
                </div>
                <div className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                    Stream Pro
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelGrid;
