
import { LayoutDashboard, Tv, Film, PlayCircle, Heart, Upload } from 'lucide-react';
import { Channel } from './types';

export const CATEGORIES = ['Tudo', 'Notícias', 'Esportes', 'Filmes', 'Entretenimento', 'Infantil', 'Documentários'];

export const MOCK_CHANNELS: Channel[] = []; // Removendo conteúdos falsos

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'live', label: 'TV ao Vivo', icon: Tv },
  { id: 'movies', label: 'Filmes VOD', icon: Film },
  { id: 'series', label: 'Séries', icon: PlayCircle },
  { id: 'favorites', label: 'Favoritos', icon: Heart },
  { id: 'upload', label: 'Importar Lista', icon: Upload },
];
