
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, User, Lock, Globe, Zap, Loader2, Star, List, Link as LinkIcon } from 'lucide-react';
import { authenticateXtream } from '../services/xtreamService';
import { XtreamAccount, Channel } from '../types';

interface PlaylistUploaderProps {
  onAuthSuccess: (account: XtreamAccount) => void;
  onM3USuccess: (channels: Channel[]) => void;
}

const QUICK_HOSTS = [
  { label: 'SERVIDOR 1', url: 'http://mwplay.top' },
  { label: 'SERVIDOR 2', url: 'http://mtcloud.cloud' }
];

const PlaylistUploader: React.FC<PlaylistUploaderProps> = ({ onAuthSuccess, onM3USuccess }) => {
  const [method, setMethod] = useState<'xtream' | 'm3u'>('xtream');
  const [xtream, setXtream] = useState({ url: '', username: '', password: '' });
  const [m3uUrl, setM3uUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFastLogin = async () => {
    if (!xtream.url || !xtream.username || !xtream.password) {
        setError('Preencha todos os campos.');
        return;
    }
    setLoading(true);
    setError(null);
    try {
        await authenticateXtream(xtream);
        onAuthSuccess(xtream);
    } catch (err: any) {
        setError(err.message || 'Falha ao autenticar.');
        setLoading(false);
    }
  };

  const handleM3UImport = async () => {
    if (!m3uUrl) {
      setError('Insira a URL da lista M3U.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(m3uUrl);
      const text = await response.text();
      
      const channels: Channel[] = [];
      const lines = text.split('\n');
      let currentChannel: Partial<Channel> = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
          const nameMatch = line.match(/,(.*)$/);
          const logoMatch = line.match(/tvg-logo="(.*?)"/);
          const groupMatch = line.match(/group-title="(.*?)"/);
          
          currentChannel = {
            name: nameMatch ? nameMatch[1] : 'Sem Nome',
            logo: logoMatch ? logoMatch[1] : '',
            category: groupMatch ? groupMatch[1] : 'Geral',
            isFavorite: false,
            type: 'live'
          };
        } else if (line.startsWith('http')) {
          if (currentChannel.name) {
            currentChannel.url = line;
            currentChannel.id = `m3u-${Math.random().toString(36).substr(2, 9)}`;
            channels.push(currentChannel as Channel);
            currentChannel = {};
          }
        }
      }

      if (channels.length === 0) throw new Error('Nenhum canal encontrado nesta lista.');
      onM3USuccess(channels);
    } catch (err: any) {
      setError('Falha ao processar lista M3U. Verifique a URL.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg animate-in zoom-in-95 duration-500">
      <div className="bg-zinc-950 rounded-[3rem] border border-zinc-900 p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-600/30">
            <Star className="text-white" size={32} fill="white" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase mb-1">IPTV <span className="text-red-600">PLUS</span></h1>
          <p className="text-zinc-600 font-bold uppercase text-[9px] tracking-[0.4em]">Sua Central de Entretenimento</p>
        </div>

        {/* Tabs de Método */}
        <div className="flex bg-black p-1 rounded-2xl border border-zinc-900 mb-8">
          <button 
            onClick={() => setMethod('xtream')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'xtream' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Zap size={14} fill={method === 'xtream' ? 'currentColor' : 'none'} /> Xtream Codes
          </button>
          <button 
            onClick={() => setMethod('m3u')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'm3u' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <List size={14} /> Importar Lista
          </button>
        </div>

        <div className="space-y-6">
          {method === 'xtream' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {QUICK_HOSTS.map((host) => (
                  <button
                    key={host.url}
                    onClick={() => setXtream(prev => ({ ...prev, url: host.url }))}
                    className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      xtream.url.includes(host.url.replace('http://', ''))
                      ? 'bg-red-600 border-red-600 text-white shadow-lg' 
                      : 'bg-black border-zinc-900 text-zinc-500'
                    }`}
                  >
                    {host.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="text"
                  placeholder="URL do Host"
                  value={xtream.url}
                  onChange={(e) => setXtream({...xtream, url: e.target.value})}
                  className="w-full bg-black border border-zinc-900 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input 
                    type="text"
                    placeholder="Usuário"
                    value={xtream.username}
                    onChange={(e) => setXtream({...xtream, username: e.target.value})}
                    className="w-full bg-black border border-zinc-900 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input 
                    type="password"
                    placeholder="Senha"
                    value={xtream.password}
                    onChange={(e) => setXtream({...xtream, password: e.target.value})}
                    className="w-full bg-black border border-zinc-900 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 text-sm"
                  />
                </div>
              </div>
              <button 
                onClick={handleFastLogin}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'ENTRAR AGORA'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="text"
                  placeholder="Cole a URL .m3u ou .m3u8 aqui"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600 text-sm"
                />
              </div>
              <button 
                onClick={handleM3UImport}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'IMPORTAR AGORA'}
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-[10px] font-bold uppercase animate-shake">
                <AlertCircle size={16} />
                {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistUploader;
