
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Channel, Season, Episode, XtreamAccount } from '../types';
import { 
  X, Maximize2, Volume2, Play, Pause, AlertCircle, Loader2, 
  RefreshCw, SkipForward, SkipBack, Zap, ZapOff, ArrowRight, List,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { fetchSeriesInfo } from '../services/xtreamService';

interface PlayerProps {
  channel: Channel | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  nextChannel?: Channel | null;
  account?: XtreamAccount | null;
}

const Player: React.FC<PlayerProps> = ({ channel, onClose, onNext, onPrevious, nextChannel, account }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [showEpisodes, setShowEpisodes] = useState(false);
  
  const hlsRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  const initPlayer = useCallback((customUrl?: string) => {
    if (!channel || !videoRef.current) return;
    
    const streamUrl = customUrl || channel.url;
    
    // Se for série e não tiver URL (porque depende de episódio) e nenhum episódio selecionado
    if (!streamUrl && channel.type === 'series' && !activeEpisode) {
        setIsLoading(false);
        setShowEpisodes(true);
        return;
    }

    if (!streamUrl) {
      setError("URL de transmissão não encontrada.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);
    setShowNextOverlay(false);
    
    const video = videoRef.current;
    
    // Reset do vídeo para garantir nova carga
    video.pause();
    video.removeAttribute('src');
    video.load();

    const hlsConfig = {
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 60,
      xhrSetup: (xhr: any) => { xhr.withCredentials = false; }
    };

    if (streamUrl.includes('.m3u8')) {
      const WinHls = (window as any).Hls;
      if (WinHls && WinHls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new WinHls(hlsConfig);
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(WinHls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => setIsPlaying(false));
          setIsLoading(false);
        });
        hls.on(WinHls.Events.ERROR, (_: any, data: any) => {
          if (data.fatal) {
            setError(`Erro de rede ou formato incompatível (HLS).`);
            setIsLoading(false);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => setIsPlaying(false));
          setIsLoading(false);
        });
      }
    } else {
      // Para MP4/MKV/AVI (VOD e Séries)
      video.src = streamUrl;
      video.play().catch((e) => {
        console.error("Playback error:", e);
        setError("O servidor não respondeu ou o formato é incompatível com o navegador.");
        setIsLoading(false);
      });
    }
  }, [channel, activeEpisode]);

  useEffect(() => {
    if (channel?.type === 'series' && account) {
      setIsLoading(true);
      fetchSeriesInfo(account, channel.id).then(data => {
        setSeasons(data);
        setShowEpisodes(true);
        setIsLoading(false);
        // Não inicia player automaticamente para séries, espera selecionar episódio
      }).catch(err => {
        setError("Não foi possível carregar as temporadas.");
        setIsLoading(false);
      });
    } else {
      setSeasons([]);
      setActiveEpisode(null);
      setShowEpisodes(false);
      initPlayer();
    }
    
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [channel, account]); // Removido initPlayer das dependências para evitar loop

  const playEpisode = (ep: Episode) => {
    if (!account) return;
    const baseUrl = account.url.trim().replace(/\/$/, "");
    // Correção: Alguns servidores usam a rota /series/ mas o arquivo é servido via stream id direto
    const extension = ep.container_extension || 'mp4';
    const streamUrl = `${baseUrl}/series/${account.username}/${account.password}/${ep.id}.${extension}`;
    
    setActiveEpisode(ep);
    initPlayer(streamUrl);
  };

  const handleVideoEnded = useCallback(() => {
    if (isAutoplay && onNext) {
      onNext();
    }
  }, [isAutoplay, onNext]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300 overflow-hidden">
      {/* Top Bar */}
      <div className="h-20 flex items-center justify-between px-8 border-b border-zinc-900 bg-black/95 backdrop-blur-xl z-20">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
            <img src={channel.logo} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-black text-lg text-white uppercase truncate tracking-tighter">
                {activeEpisode ? `${channel.name} - T${activeEpisode.season}E${activeEpisode.episode_num}` : channel.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-zinc-600 animate-pulse' : 'bg-red-600'}`} />
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">
                  {isLoading ? 'BUFFERING' : isPlaying ? 'LIVE STREAM' : 'PAUSADO'}
                </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            {channel.type === 'series' && (
                <button 
                    onClick={() => setShowEpisodes(!showEpisodes)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                        showEpisodes ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                >
                    <List size={16} /> LISTA DE EPISÓDIOS
                </button>
            )}
            <button onClick={onClose} className="p-4 bg-zinc-900 hover:bg-red-600 rounded-2xl transition-all active:scale-95 group">
                <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden bg-zinc-950">
        {/* Playback Engine */}
        <div className="flex-1 relative flex flex-col items-center justify-center group">
            {isLoading && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-sm">
                    <div className="relative mb-6">
                        <Loader2 className="text-red-600 animate-spin" size={64} />
                        <Zap className="absolute inset-0 m-auto text-white/20" size={24} />
                    </div>
                    <p className="text-zinc-400 font-black uppercase text-xs tracking-[0.4em]">Sincronizando com Servidor...</p>
                </div>
            )}

            {error ? (
                <div className="flex flex-col items-center gap-8 p-12 text-center max-w-lg z-30 bg-zinc-900/50 rounded-[3rem] border border-zinc-800">
                    <div className="p-6 bg-red-600/10 rounded-full">
                        <AlertCircle className="text-red-600" size={48} />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-2xl uppercase tracking-tighter mb-2">Falha no Carregamento</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">{error}</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => initPlayer()} className="py-5 px-10 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                            <RefreshCw size={18} /> Tentar Novamente
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                    <video 
                        ref={videoRef}
                        onPlay={() => { setIsPlaying(true); setIsLoading(false); }}
                        onPause={() => setIsPlaying(false)}
                        onEnded={handleVideoEnded}
                        playsInline
                        className="w-full h-full cursor-pointer object-contain"
                        onClick={togglePlay}
                    />
                    
                    {/* Floating Controls Row */}
                    <div className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <div className="flex items-center gap-8 bg-black/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                            <button 
                                onClick={onPrevious}
                                className="p-4 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                                title="Anterior"
                            >
                                <SkipBack size={32} fill="currentColor" />
                            </button>

                            <button 
                                onClick={togglePlay} 
                                className="w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 transition-all active:scale-90"
                            >
                                {isPlaying ? <Pause className="text-white fill-current" size={32} /> : <Play className="text-white fill-current ml-1" size={32} />}
                            </button>

                            <button 
                                onClick={onNext}
                                className="p-4 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                                title="Próximo"
                            >
                                <SkipForward size={32} fill="currentColor" />
                            </button>
                        </div>
                        
                        <div className="px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                                Navegação Ativa • Use as setas do teclado
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Series Episodes Drawer */}
        {channel.type === 'series' && showEpisodes && (
            <div className="w-96 bg-zinc-950 border-l border-zinc-900 overflow-y-auto animate-in slide-in-from-right duration-500">
                <div className="p-8 sticky top-0 bg-zinc-950/95 backdrop-blur-md z-10 border-b border-zinc-900">
                    <h3 className="font-black text-white uppercase tracking-tighter text-2xl">Temporadas</h3>
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1">{seasons.length} temporadas disponíveis</p>
                </div>
                <div className="p-6 space-y-10">
                    {seasons.map((season) => (
                        <div key={season.number} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <div className="h-px flex-1 bg-zinc-900"></div>
                                <h4 className="text-zinc-500 font-black text-[11px] uppercase tracking-[0.2em]">{season.name}</h4>
                                <div className="h-px flex-1 bg-zinc-900"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {season.episodes.map((ep) => (
                                    <button 
                                        key={ep.id}
                                        onClick={() => playEpisode(ep)}
                                        className={`w-full text-left p-5 rounded-[1.5rem] transition-all border group/ep ${
                                            activeEpisode?.id === ep.id 
                                            ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20' 
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-black text-xs uppercase tracking-tight">Episódio {ep.episode_num}</span>
                                            {activeEpisode?.id === ep.id ? (
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            ) : (
                                                <Play size={12} className="opacity-0 group-hover/ep:opacity-100 transition-opacity" />
                                            )}
                                        </div>
                                        <p className={`text-[11px] truncate ${activeEpisode?.id === ep.id ? 'text-white/80' : 'text-zinc-600'}`}>
                                            {ep.title || `Assistir Episódio ${ep.episode_num}`}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Player;
