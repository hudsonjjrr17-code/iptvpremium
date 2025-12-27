
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import ChannelGrid from './components/ChannelGrid';
import AISuggestions from './components/AISuggestions';
import PlaylistUploader from './components/PlaylistUploader';
import { Search, Monitor, LogOut, Loader2 } from 'lucide-react';
import { CATEGORIES } from './constants';
import { ViewType, Channel } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  // Debounce para a busca não travar a digitação em listas gigantes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filtro de Alta Performance: Otimizado para 100k+ itens
  const filteredChannels = useMemo(() => {
    if (!channels.length) return [];
    
    const query = debouncedSearch.toLowerCase();
    const isDashboard = currentView === 'dashboard';
    const isFavorites = currentView === 'favorites';
    const isLive = currentView === 'live';
    const isMovies = currentView === 'movies';
    const isSeries = currentView === 'series';
    const cat = selectedCategory;

    // Filtro em uma única passada para máxima velocidade
    return channels.filter((c) => {
      // 1. Filtro de View Principal (Mais restritivo primeiro)
      if (isFavorites && !c.isFavorite) return false;
      if (isLive && c.type !== 'live') return false;
      if (isMovies && c.type !== 'movie') return false;
      if (isSeries && c.type !== 'series') return false;
      
      // 2. Filtro de Categoria
      if (cat !== 'Tudo' && c.category !== cat) return false;
      
      // 3. Filtro de Busca
      if (query !== '' && !c.name.toLowerCase().includes(query)) return false;
      
      return true;
    });
  }, [channels, debouncedSearch, selectedCategory, currentView]);

  const toggleFavorite = useCallback((id: string) => {
    setChannels(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      const next = [...prev];
      next[index] = { ...next[index], isFavorite: !next[index].isFavorite };
      return next;
    });
  }, []);

  const handleImportChannels = useCallback((newChannels: Channel[]) => {
    setChannels(newChannels);
    setIsLoggedIn(true);
    setView('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setChannels([]);
    setIsLoggedIn(false);
    setView('dashboard');
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('Tudo');
  }, []);

  const handleViewChange = useCallback((view: ViewType) => {
    setView(view);
    // Ao trocar de aba, limpamos a busca para a transição ser instantânea
    setSearchQuery('');
    setDebouncedSearch('');
  }, []);

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
            <Loader2 className="text-red-600 animate-spin mb-6" size={48} />
            <h3 className="text-2xl font-black text-white mb-2 uppercase">SINCRONIZANDO CONTEÚDO</h3>
            <p className="text-zinc-500 max-w-sm mb-10">Aguarde enquanto processamos seu acervo premium...</p>
            <button onClick={handleLogout} className="text-red-600 font-bold uppercase text-xs tracking-widest">Cancelar e Voltar</button>
          </div>
        );
    }

    return (
      <div className="space-y-12">
        {currentView === 'dashboard' && debouncedSearch === '' && (
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
            currentView === 'dashboard' ? 'DESTAQUES PREMIUM' :
            currentView === 'favorites' ? 'MEUS FAVORITOS' :
            currentView === 'movies' ? 'CINE VOD' :
            currentView === 'live' ? 'TV AO VIVO' :
            currentView === 'series' ? 'SÉRIES E NOVELAS' : 'CONTEÚDOS'
          }
        />
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      <Sidebar currentView={currentView} setView={handleViewChange} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 md:h-24 flex items-center justify-between px-6 md:px-10 bg-black/90 backdrop-blur-2xl border-b border-zinc-900 sticky top-0 z-30">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text"
                placeholder="Pesquise instantaneamente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl py-3 md:py-4 pl-12 pr-4 focus:outline-none focus:border-red-600 transition-all font-medium placeholder:text-zinc-800 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-6">
            <div className="hidden lg:flex gap-2">
                {CATEGORIES.slice(0, 3).map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedCategory === cat ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            <button onClick={handleLogout} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-600 transition-all">
                <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth bg-black">
          {renderContent()}
        </div>

        <footer className="h-10 bg-black border-t border-zinc-900 flex items-center justify-between px-10 shrink-0">
            <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                IPTV PLUS v5.0 ULTRA • PERFORMANCE TURBO
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black text-green-500 uppercase">STREAMING ENGINE OK</span>
            </div>
        </footer>

        <Player channel={activeChannel} onClose={() => setActiveChannel(null)} />
      </main>
    </div>
  );
};

export default App;
