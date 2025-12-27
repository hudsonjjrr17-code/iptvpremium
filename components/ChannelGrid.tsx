
import React, { useState, useEffect, useMemo } from 'react';
import { Channel } from '../types';
import { Play, Heart, Plus, Film } from 'lucide-react';

interface ChannelGridProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  title: string;
}

const ITEMS_PER_PAGE = 30;

const ChannelGrid: React.FC<ChannelGridProps> = ({ channels, onChannelSelect, onToggleFavorite, title }) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [channels.length, title]);

  const visibleChannels = useMemo(() => {
    return channels.slice(0, visibleCount);
  }, [channels, visibleCount]);

  const hasMore = visibleCount < channels.length;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between border-l-4 border-red-600 pl-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{title}</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Acervo Premium</p>
        </div>
        <span className="text-zinc-600 text-sm font-black">{channels.length} ITENS</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
        {visibleChannels.map((channel) => (
          <div 
            key={channel.id}
            className="group relative bg-zinc-950 border border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-600/10"
          >
            <div className="aspect-[3/4] relative overflow-hidden bg-zinc-900">
              {channel.logo ? (
                <img 
                  src={channel.logo} 
                  alt={channel.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&h=400&auto=format&fit=crop`;
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-700">
                  <Film size={48} />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <button 
                  onClick={() => onChannelSelect(channel)}
                  className="w-12 h-12 md:w-16 md:h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-500"
                >
                  <Play className="text-white fill-current ml-1" size={24} />
                </button>
              </div>

              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(channel.id);
                }}
                className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                  channel.isFavorite 
                    ? 'bg-red-600 text-white' 
                    : 'bg-black/40 text-white/70 hover:bg-red-600/20'
                }`}
              >
                <Heart size={16} fill={channel.isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <div className="p-3 md:p-4">
              <h3 className="font-bold text-white truncate text-sm md:text-base">
                {channel.name}
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase truncate mt-1">{channel.category}</p>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
            className="flex items-center gap-3 px-10 py-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] transition-all"
          >
            <Plus size={18} /> Carregar Mais
          </button>
        </div>
      )}
    </div>
  );
};

export default ChannelGrid;
