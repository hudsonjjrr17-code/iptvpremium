
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import ChannelGrid from './components/ChannelGrid';
import AISuggestions from './components/AISuggestions';
import PlaylistUploader from './components/PlaylistUploader';
import { Search, LogOut, Loader2, Zap, Database, RefreshCw } from 'lucide-react';
import { ViewType, Channel, XtreamAccount } from './types';
import { fetchCategoryData, clearCache } from './services/xtreamService';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [account, setAccount] = useState<XtreamAccount | null>(null);
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [syncStatus, setSyncStatus] = useState({ live: false, movies: false, series: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadData = useCallback(async (acc: XtreamAccount) => {
    setIsRefreshing(true);
    setSyncStatus({ live: false, movies: false, series: false });
    setChannels([]);
    
    const fetchPromises = [
      fetchCategoryData(acc, 'live', 'Canais Ao Vivo').then(data => {
        setChannels(prev => [...prev, ...data]);
        setSyncStatus(s => ({ ...s, live: true }));
      }),
      fetchCategoryData(acc, 'movie', 'Filmes').then(data => {
        setChannels(prev => [...prev, ...data]);
        setSyncStatus(s => ({ ...s, movies: true }));
      }),
      fetchCategoryData(acc, 'series', 'Séries').then(data => {
        setChannels(prev => [...prev, ...data]);
        setSyncStatus(s => ({ ...s, series: true }));
      })
    ];

    await Promise.allSettled(fetchPromises);
    setIsRefreshing(false);
  }, []);

  // Aciona o refresh automático assim que logar
  useEffect(() => {
    if (isLoggedIn && account) {
      clearCache(); // Garante dados novos
      loadData(account);
    }
  }, [isLoggedIn, account, loadData]);

  const handleRefresh = () => {
    if (!account || isRefreshing) return;
    clearCache();
    loadData(account);
  };

  const filteredChannels = useMemo(() => {
    if (!channels.length) return [];
    const query = debouncedSearch.toLowerCase();

    return channels.filter((c) => {
      if (currentView === 'favorites' && !c.isFavorite) return false;
      if (currentView === 'live' && c.type !== 'live') return false;
      if (currentView === 'movies' && c.type !== 'movie') return false;
      if (currentView === 'series' && c.type !== 'series') return false;
      if (selectedCategory !== 'Tudo' && c.category !== selectedCategory) return false;
      if (query !== '' && !c.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [channels, debouncedSearch, selectedCategory, currentView]);

  const handleNextChannel = useCallback(() => {
    if (!activeChannel) return;
    const currentIndex = filteredChannels.findIndex(c => c.id === activeChannel.id);
    if (currentIndex !== -1 && currentIndex < filteredChannels.length - 1) {
      setActiveChannel(filteredChannels[currentIndex + 1]);
    }
  }, [activeChannel, filteredChannels]);

  const handlePrevChannel = useCallback(() => {
    if (!activeChannel) return;
    const currentIndex = filteredChannels.findIndex(c => c.id === activeChannel.id);
    if (currentIndex > 0) {
      setActiveChannel(filteredChannels[currentIndex - 1]);
    }
  }, [activeChannel, filteredChannels]);

  const nextUp = useMemo(() => {
    if (!activeChannel) return null;
    const idx = filteredChannels.findIndex(c => c.id === activeChannel.id);
    return idx !== -1 && idx < filteredChannels.length - 1 ? filteredChannels[idx + 1] : null;
  }, [activeChannel, filteredChannels]);

  const toggleFavorite = useCallback((id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  }, []);

  const handleStartSession = (acc: XtreamAccount) => {
    setAccount(acc);
    setIsLoggedIn(true);
  };

  const handleM3ULoaded = (loadedChannels: Channel[]) => {
    setChannels(loadedChannels);
    setSyncStatus({ live: true, movies: true, series: true });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setChannels([]);
    setAccount(null);
    setIsLoggedIn(false);
    setSyncStatus({ live: false, movies: false, series: false });
    clearCache();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <PlaylistUploader onAuthSuccess={handleStartSession} onM3USuccess={handleM3ULoaded} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      <Sidebar currentView={currentView} setView={setView} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-8 bg-black/90 backdrop-blur-2xl border-b border-zinc-900 sticky top-0 z-30">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text"
                placeholder="Busca rápida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-600 transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-6">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Atualizar Lista"
              className={`p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all ${isRefreshing ? 'opacity-50' : 'active:scale-90'}`}
            >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleLogout} 
              title="Sair"
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-600 transition-colors"
            >
                <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-black">
          {isRefreshing ? (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
              <div className="relative mb-6">
                <Loader2 className="text-red-600 animate-spin" size={64} />
                <Zap className="absolute inset-0 m-auto text-white opacity-20" size={24} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                Atualizando...
              </h3>
            </div>
          ) : (
            <div className="space-y-12">
              {currentView === 'dashboard' && debouncedSearch === '' && channels.length > 0 && (
                <AISuggestions allChannels={channels} onChannelSelect={setActiveChannel} />
              )}
              <ChannelGrid 
                channels={filteredChannels}
                onChannelSelect={setActiveChannel}
                onToggleFavorite={toggleFavorite}
                title={
                  currentView === 'dashboard' ? 'EM ALTA' :
                  currentView === 'favorites' ? 'MINHA LISTA' :
                  currentView === 'movies' ? 'CINEMA VOD' :
                  currentView === 'live' ? 'TV AO VIVO' :
                  currentView === 'series' ? 'SÉRIES' : 'CONTEÚDO'
                }
              />
            </div>
          )}
        </div>

        <footer className="h-10 bg-black border-t border-zinc-900 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">IPTV PLUS v6.0</span>
            </div>
            <div className="flex items-center gap-2">
                <Database size={10} className="text-green-500" />
                <span className="text-[9px] font-black text-green-500 uppercase">SERVIDOR ATIVO</span>
            </div>
        </footer>

        <Player 
          channel={activeChannel} 
          account={account}
          onClose={() => setActiveChannel(null)}
          onNext={handleNextChannel}
          onPrevious={handlePrevChannel}
          nextChannel={nextUp}
        />
      </main>
    </div>
  );
};

export default App;
