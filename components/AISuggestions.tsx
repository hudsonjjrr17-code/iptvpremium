
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, RefreshCw, MessageSquare } from 'lucide-react';
import { Channel } from '../types';
import { getAIRecommendations } from '../services/geminiService';

interface AISuggestionsProps {
  allChannels: Channel[];
  onChannelSelect: (channel: Channel) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ allChannels, onChannelSelect }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState('');

  const fetchRecommendations = async (userMood?: string) => {
    setLoading(true);
    const recs = await getAIRecommendations(allChannels, userMood);
    const hydratedRecs = recs.map((r: any) => ({
      ...r,
      channel: allChannels.find(c => c.id === r.id)
    })).filter((r: any) => r.channel);
    
    setRecommendations(hydratedRecs);
    setLoading(false);
  };

  useEffect(() => {
    if (allChannels.length > 0 && recommendations.length === 0) {
      fetchRecommendations();
    }
  }, [allChannels]);

  return (
    <div className="bg-gradient-to-br from-red-600/20 via-zinc-950 to-black rounded-[2.5rem] p-10 border border-red-600/20 mb-12 overflow-hidden relative shadow-2xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 blur-[120px] pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <Sparkles className="text-red-500" size={20} />
            </div>
            <span className="text-red-500 text-xs font-black uppercase tracking-[0.3em]">IA IPTV Plus</span>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-none">O QUE VOCÊ QUER <br/><span className="text-red-600">ASSISTIR HOJE?</span></h2>
          <p className="text-zinc-500 mb-8 text-lg font-medium">
            Nossa inteligência artificial analisa sua lista e sugere o conteúdo perfeito baseado no seu humor.
          </p>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="Ex: 'Quero um filme de terror' ou 'Jogo de futebol'"
                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 transition-all font-medium"
                />
            </div>
            <button 
                onClick={() => fetchRecommendations(mood)}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-2xl font-black flex items-center gap-2 transition-all disabled:opacity-50 uppercase text-xs tracking-widest shadow-lg shadow-red-600/20"
            >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                Buscar
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {loading ? (
            Array(2).fill(0).map((_, i) => (
                <div key={i} className="min-w-[300px] h-52 bg-zinc-900 rounded-3xl animate-pulse" />
            ))
          ) : (
            recommendations.map((rec, i) => (
              <div 
                key={i}
                onClick={() => onChannelSelect(rec.channel)}
                className="min-w-[300px] bg-black/60 border border-zinc-900 rounded-3xl p-6 hover:border-red-600/50 cursor-pointer transition-all group backdrop-blur-xl"
              >
                <div className="flex items-center gap-4 mb-4">
                    <img src={rec.channel.logo} alt="" className="w-14 h-14 rounded-2xl object-cover border border-zinc-800" />
                    <div className="flex-1">
                        <h4 className="font-bold text-white truncate group-hover:text-red-500 transition-colors">{rec.channel.name}</h4>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{rec.channel.category}</span>
                    </div>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-3 font-medium leading-relaxed italic">"{rec.reason}"</p>
                <div className="mt-6 flex items-center justify-end">
                    <span className="text-[10px] font-black text-red-600 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        ASSISTIR AGORA <ArrowRight size={14} />
                    </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
