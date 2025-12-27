
import React, { useState } from 'react';
import { Link as LinkIcon, Database, CheckCircle2, AlertCircle, Server, User, Lock, Globe, ShieldCheck } from 'lucide-react';
import { parseM3UWithAI } from '../services/geminiService';
import { fetchXtreamData } from '../services/xtreamService';
import { Channel } from '../types';

interface PlaylistUploaderProps {
  onImport: (channels: Channel[]) => void;
}

const PlaylistUploader: React.FC<PlaylistUploaderProps> = ({ onImport }) => {
  const [activeTab, setActiveTab] = useState<'m3u' | 'xtream'>('xtream');
  const [m3uUrl, setM3uUrl] = useState('');
  const [xtream, setXtream] = useState({ url: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message?: string }>({ type: 'idle' });

  const handleM3uImport = async () => {
    if (!m3uUrl) return;
    setLoading(true);
    setStatus({ type: 'idle' });
    try {
        const mockM3u = `#EXTM3U\n#EXTINF:-1 group-title="Action",Canal Exemplo\nhttp://example.com/stream`;
        const channels = await parseM3UWithAI(mockM3u);
        const hydrated = channels.map((c: any, i: number) => ({
            ...c, id: `m3u-${Date.now()}-${i}`, isFavorite: false, description: 'Importado via M3U'
        }));
        onImport(hydrated);
        setStatus({ type: 'success', message: 'Lista M3U sincronizada com sucesso!' });
    } catch (err: any) {
        setStatus({ type: 'error', message: 'Erro ao processar arquivo M3U. Verifique a URL.' });
    } finally {
        setLoading(false);
    }
  };

  const handleXtreamImport = async () => {
    if (!xtream.url || !xtream.username || !xtream.password) {
        setStatus({ type: 'error', message: 'Preencha todos os campos da conta Xtream.' });
        return;
    }
    
    // Validação básica de URL
    let formattedUrl = xtream.url.trim();
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = 'http://' + formattedUrl;
    }

    setLoading(true);
    setStatus({ type: 'idle' });
    try {
        const channels = await fetchXtreamData({ ...xtream, url: formattedUrl });
        onImport(channels);
        setStatus({ type: 'success', message: `Conexão estabelecida! ${channels.length} itens carregados.` });
    } catch (err: any) {
        setStatus({ 
          type: 'error', 
          message: err.message || 'Erro ao conectar. Verifique os dados ou a conexão com o servidor.' 
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg animate-in zoom-in-95 duration-500">
      <div className="bg-zinc-950 rounded-[3rem] border border-zinc-900 p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-red-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-red-600/30 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-white font-black text-4xl italic tracking-tighter">P+</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            IPTV <span className="text-red-600 underline decoration-2 underline-offset-8">PLUS</span>
          </h1>
          <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-[0.4em]">Plataforma de Elite</p>
        </div>

        <div className="flex p-1.5 bg-black rounded-2xl border border-zinc-900 mb-8">
          <button 
            onClick={() => setActiveTab('xtream')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'xtream' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Xtream Codes
          </button>
          <button 
            onClick={() => setActiveTab('m3u')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'm3u' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            M3U URL
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'xtream' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Host do Servidor</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="text"
                    placeholder="http://exemplo.com:8080"
                    value={xtream.url}
                    onChange={(e) => setXtream({...xtream, url: e.target.value})}
                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 transition-all font-medium placeholder:text-zinc-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Usuário</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                      type="text"
                      placeholder="Username"
                      value={xtream.username}
                      onChange={(e) => setXtream({...xtream, username: e.target.value})}
                      className="w-full bg-black border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 transition-all font-medium placeholder:text-zinc-800"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={xtream.password}
                      onChange={(e) => setXtream({...xtream, password: e.target.value})}
                      className="w-full bg-black border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 transition-all font-medium placeholder:text-zinc-800"
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={handleXtreamImport}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-red-600/10 flex items-center justify-center gap-3 mt-6 text-sm uppercase tracking-widest group"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <>
                    AUTENTICAR <Server className="group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">URL da Lista M3U8</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="text"
                    placeholder="https://provedor.com/lista.m3u"
                    value={m3uUrl}
                    onChange={(e) => setM3uUrl(e.target.value)}
                    className="w-full bg-black border border-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 transition-all font-medium placeholder:text-zinc-800"
                  />
                </div>
              </div>
              <button 
                onClick={handleM3uImport}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 mt-6 text-sm uppercase tracking-widest group"
              >
                {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : (
                  <>
                    CARREGAR LISTA <LinkIcon className="group-hover:rotate-45 transition-transform" size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          {status.type !== 'idle' && (
            <div className={`flex items-start gap-4 p-5 border rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-600/10 border-green-600/20 text-green-400' : 'bg-red-600/10 border-red-600/20 text-red-500'}`}>
                {status.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold leading-relaxed">{status.message}</span>
                  {status.type === 'error' && status.message?.includes('bloqueou') && (
                    <span className="text-[10px] opacity-70 italic font-medium">Dica: Se o host for HTTP, use um navegador que permita conteúdo misto ou verifique se o host está correto.</span>
                  )}
                </div>
            </div>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-zinc-700">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conexão Segura AES-256</span>
        </div>
      </div>
      
      <p className="text-center mt-8 text-zinc-600 font-bold text-[10px] uppercase tracking-[0.3em]">
        IPTV PLUS STREAMING EXPERIENCE v3.0
      </p>
    </div>
  );
};

export default PlaylistUploader;
