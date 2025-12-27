
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import ChannelGrid from './components/ChannelGrid';
import AISuggestions from './components/AISuggestions';
import PlaylistUploader from './components/PlaylistUploader';
import { Search, Bell, Monitor, ListFilter, LogOut } from 'lucide-react';
import { CATEGORIES } from './constants';
import { ViewType, Channel } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tudo' || c.category === selectedCategory;
      const matchesView = 
        currentView === 'favorites' ? c.isFavorite : 
        currentView === 'live' ? (c.type === 'live' || c.category !== 'Movies') : 
        currentView === 'movies' ? (c.type === 'movie' || c.category === 'Movies') :
        true;
      
      return matchesSearch && matchesCategory && matchesView;
    });
  }, [channels, searchQuery, selectedCategory, currentView]);

  const toggleFavorite = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  const handleImportChannels = (newChannels: Channel[]) => {
    setChannels(newChannels);
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    setChannels([]);
    setIsLoggedIn(false);
    setView('dashboard');
  };

  // Se não estiver logado, renderiza apenas a tela de login (Uploader) sem Sidebar/Header
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <PlaylistUploader onImport={handleImportChannels} />
      </div>
    );
  }

  const renderContent = () => {
    if (channels.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-8 text-zinc-800 border border-zinc-800 shadow-2xl">
                <Monitor size={48} />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">LISTA VAZIA</h3>
            <p className="text-zinc-500 max-w-sm font-medium mb-10 leading-relaxed">
                Algo deu errado ou sua lista não possui conteúdos.
            </p>
            <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-red-600/20 uppercase text-xs tracking-[0.2em]"
            >
                Voltar para Login
            </button>
          </div>
        );
    }

    return (
      <div className="space-y-16 animate-in fade-in duration-700">
        {currentView === 'dashboard' && (
          <AISuggestions 
            allChannels={channels} 
            onChannelSelect={setActiveChannel} 
          />
        )}
        
        <ChannelGrid 
          channels={filteredChannels}
          onChannelSelect={setActiveChannel}
          onToggleFavorite={toggleFavorite}
          title={
            currentView === 'dashboard' ? 'EM DESTAQUE' :
            currentView === 'favorites' ? 'MEUS FAVORITOS' :
            currentView === 'movies' ? 'CINE VOD PREMIUM' :
            currentView === 'live' ? 'TV AO VIVO HD' : 'TODO O ACERVO'
          }
        />
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden animate-in fade-in duration-500">
      <Sidebar currentView={currentView} setView={setView} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-24 flex items-center justify-between px-10 bg-black/80 backdrop-blur-3xl border-b border-zinc-900 sticky top-0 z-30">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Pesquise por títulos, canais ou gêneros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl py-4 pl-14 pr-4 focus:outline-none focus:border-red-600 transition-all font-medium placeholder:text-zinc-800"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-8 ml-10">
            <div className="hidden xl:flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 shadow-inner">
                {CATEGORIES.slice(0, 4).map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedCategory === cat ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-zinc-600 hover:text-zinc-300'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
                <button className="px-3 py-2 text-zinc-600 hover:text-white transition-colors">
                    <ListFilter size={18} />
                </button>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                  onClick={handleLogout}
                  className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl text-zinc-600 hover:text-red-600 transition-all title='Sair'"
                >
                  <LogOut size={20} />
                </button>
                <div className="flex items-center gap-4 pl-2 pr-6 py-2 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-lg">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-red-600/30">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=ProUser" alt="" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">PRO ACCESS</p>
                    <p className="text-sm font-black leading-none uppercase">Assinante</p>
                  </div>
                </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar scroll-smooth bg-zinc-950/20">
          {renderContent()}
        </div>

        {/* Footer info */}
        <footer className="h-12 bg-black border-t border-zinc-900 flex items-center justify-between px-10 shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Servidor:</span>
                <span className="text-[10px] font-black text-green-500 uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    ONLINE
                </span>
            </div>
            <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                IPTV PLUS © 2025 • PREMIUM STREAMING
            </div>
        </footer>

        <Player channel={activeChannel} onClose={() => setActiveChannel(null)} />
      </main>
    </div>
  );
};

export default App;
