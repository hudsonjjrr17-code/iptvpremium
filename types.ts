
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

export type ViewType = 'dashboard' | 'live' | 'movies' | 'series' | 'favorites' | 'upload';

export interface AIRecommendation {
  reason: string;
  suggestedChannelId: string;
}
