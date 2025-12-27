
import { Channel, XtreamAccount, Season, Episode } from '../types';

let dataCache: Record<string, Channel[]> = {};

export const clearCache = () => {
  dataCache = {};
};

const extremeFetch = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const proxies = [
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}&timestamp=${Date.now()}`,
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
  ];

  try {
    const directResponse = await fetch(url, { signal: controller.signal });
    if (directResponse.ok) {
      clearTimeout(timeoutId);
      return await directResponse.json();
    }
  } catch (e) {
    console.warn("CORS/Direto bloqueado, tentando proxies...");
  } finally {
    clearTimeout(timeoutId);
  }

  for (const getProxyUrl of proxies) {
    try {
      const res = await fetch(getProxyUrl(url));
      if (!res.ok) continue;
      const data = await res.json();
      let parsedData = data;
      if (data && typeof data === 'object' && 'contents' in data) {
        parsedData = data.contents ? JSON.parse(data.contents) : null;
      }
      if (parsedData) return parsedData;
    } catch (err) {
      continue;
    }
  }
  return null;
};

export const authenticateXtream = async (account: XtreamAccount) => {
  const baseUrl = account.url.trim().replace(/\/$/, "");
  const apiUrl = `${baseUrl}/player_api.php?username=${account.username}&password=${account.password}`;
  const data = await extremeFetch(apiUrl);
  if (!data || (data.user_info && data.user_info.auth === 0)) {
    throw new Error('Credenciais inválidas ou servidor offline.');
  }
  return data;
};

export const fetchSeriesInfo = async (account: XtreamAccount, seriesId: string): Promise<Season[]> => {
  const baseUrl = account.url.trim().replace(/\/$/, "");
  // seriesId vem no formato "series-123", pegamos apenas o número
  const id = seriesId.split('-')[1] || seriesId;
  const apiUrl = `${baseUrl}/player_api.php?username=${account.username}&password=${account.password}&action=get_series_info&series_id=${id}`;
  
  const data = await extremeFetch(apiUrl);
  if (!data || !data.episodes) return [];

  const seasonsMap: Record<number, Episode[]> = data.episodes;
  const seasons: Season[] = Object.keys(seasonsMap).map(key => {
    const seasonNum = parseInt(key);
    return {
      name: `Temporada ${seasonNum}`,
      number: seasonNum,
      episodes: seasonsMap[seasonNum].map(ep => ({
        id: ep.id,
        title: ep.title,
        container_extension: ep.container_extension || 'mp4',
        season: ep.season,
        episode_num: ep.episode_num
      }))
    };
  });

  return seasons.sort((a, b) => a.number - b.number);
};

export const fetchCategoryData = async (
  account: XtreamAccount, 
  type: 'live' | 'movie' | 'series',
  label: string
): Promise<Channel[]> => {
  const cacheKey = `${account.username}-${type}`;
  if (dataCache[cacheKey]) return dataCache[cacheKey];

  const baseUrl = account.url.trim().replace(/\/$/, "");
  const actions = { 
    live: 'get_live_streams', 
    movie: 'get_vod_streams', 
    series: 'get_series' 
  };
  
  const apiUrl = `${baseUrl}/player_api.php?username=${account.username}&password=${account.password}&action=${actions[type]}`;
  
  const rawItems = await extremeFetch(apiUrl);
  if (!Array.isArray(rawItems)) return [];

  const result: Channel[] = rawItems.map(item => {
    const streamId = item.stream_id || item.series_id || item.id;
    const extension = item.container_extension || 'mp4';
    const logo = item.stream_icon || item.cover || item.series_info?.cover || '';
    
    let streamUrl = '';
    if (type === 'live') {
      streamUrl = `${baseUrl}/live/${account.username}/${account.password}/${streamId}.m3u8`;
    } else if (type === 'movie') {
      streamUrl = `${baseUrl}/movie/${account.username}/${account.password}/${streamId}.${extension}`;
    } else {
      // Para séries, a URL de stream é construída dinamicamente por episódio no Player
      streamUrl = ''; 
    }

    return {
      id: `${type}-${streamId}`,
      name: item.name || item.title || 'Sem nome',
      logo: logo,
      category: item.category_name || label,
      url: streamUrl,
      isFavorite: false,
      type: type,
      description: item.plot || item.description || ''
    };
  }).filter(c => c.id && c.name);

  dataCache[cacheKey] = result;
  return result;
};
