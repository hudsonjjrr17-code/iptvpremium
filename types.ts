
export interface Channel {
  id: string;
  name: string;
  logo?: string;
  category: string;
  url: string;
  isFavorite: boolean;
  description?: string;
  streamId?: string;
  type?: 'live' | 'movie' | 'series';
}

export interface Episode {
  id: string;
  title: string;
  container_extension: string;
  season: number;
  episode_num: number;
  info?: any;
}

export interface Season {
  name: string;
  number: number;
  episodes: Episode[];
}

export interface XtreamAccount {
  url: string;
  username: string;
  password: string;
}

export interface Playlist {
  id: string;
  name: string;
  channels: Channel[];
  createdAt: string;
}

export type ViewType = 'dashboard' | 'live' | 'movies' | 'series' | 'favorites';

export interface AIRecommendation {
  reason: string;
  suggestedChannelId: string;
}
