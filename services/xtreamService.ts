
import { Channel, XtreamAccount } from '../types';

/**
 * Tenta buscar dados usando uma malha de proxies para contornar bloqueios e CORS.
 */
const extremeFetch = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const proxies = [
    (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}&timestamp=${Date.now()}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
  ];

  try {
    const directResponse = await fetch(url, { signal: controller.signal });
    if (directResponse.ok) {
      clearTimeout(timeoutId);
      return await directResponse.json();
    }
  } catch (e) {
    console.warn("Conexão direta indisponível. Iniciando malha de proxies...");
  } finally {
    clearTimeout(timeoutId);
  }

  for (const getProxyUrl of proxies) {
    try {
      const pUrl = getProxyUrl(url);
      const res = await fetch(pUrl);
      if (!res.ok) continue;

      const data = await res.json();
      if (data && typeof data === 'object' && 'contents' in data) {
        if (!data.contents) continue;
        return JSON.parse(data.contents);
      }
      if (data) return data;
    } catch (err) {
      console.warn(`Falha no proxy`);
    }
  }
  
  throw new Error("O servidor não respondeu. Verifique seus dados ou se o servidor está online.");
};

/**
 * Transforma os dados brutos do Xtream em objetos Channel de forma performática.
 * Processa em pequenos pedaços para não travar a thread principal se a lista for gigantesca.
 */
const processInChunks = async (
  items: any[], 
  type: 'live' | 'movie' | 'series', 
  baseUrl: string, 
  auth: { u: string, p: string },
  label: string
): Promise<Channel[]> => {
  const result: Channel[] = [];
  const len = items.length;
  const chunkSize = 2000; // Processa 2000 itens por vez para manter a UI responsiva

  for (let i = 0; i < len; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    
    // Processamento rápido do pedaço
    for (let j = 0; j < chunk.length; j++) {
      const item = chunk[j];
      const streamId = item.stream_id || item.series_id;
      if (!streamId) continue;

      let streamUrl = '';
      if (type === 'live') {
        streamUrl = `${baseUrl}/live/${auth.u}/${auth.p}/${streamId}.m3u8`;
      } else if (type === 'movie') {
        streamUrl = `${baseUrl}/movie/${auth.u}/${auth.p}/${streamId}.${item.container_extension || 'mp4'}`;
      } else {
        streamUrl = `${baseUrl}/series/${auth.u}/${auth.p}/${streamId}.mp4`; 
      }

      result.push({
        id: `${type}-${streamId}`,
        name: item.name || 'Sem nome',
        logo: item.stream_icon || item.cover || '',
        category: item.category_name || label,
        url: streamUrl,
        isFavorite: false,
        description: `Streaming Premium - ${label}`,
        streamId: String(streamId),
        type: type
      });
    }

    // Pequena pausa para permitir que o navegador processe eventos de UI
    if (i + chunkSize < len) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  return result;
};

export const fetchXtreamData = async (account: XtreamAccount): Promise<Channel[]> => {
  let { url, username, password } = account;
  
  url = url.trim();
  if (!url.startsWith('http')) url = 'http://' + url;
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  
  const authParams = `username=${username}&password=${password}`;
  const apiUrl = `${baseUrl}/player_api.php?${authParams}`;

  try {
    const authData = await extremeFetch(apiUrl);
    
    if (!authData || (authData.user_info && authData.user_info.auth === 0)) {
      throw new Error('Credenciais recusadas pelo servidor.');
    }

    const endpoints = [
      { action: 'get_live_streams', type: 'live' as const, label: 'Canais' },
      { action: 'get_vod_streams', type: 'movie' as const, label: 'Filmes' },
      { action: 'get_series', type: 'series' as const, label: 'Séries' }
    ];

    // Busca os dados (I/O) em paralelo
    const fetchPromises = endpoints.map(ep => extremeFetch(`${apiUrl}&action=${ep.action}`));
    const rawDataResults = await Promise.allSettled(fetchPromises);

    let allChannels: Channel[] = [];

    // Processa cada categoria de forma otimizada
    for (let i = 0; i < rawDataResults.length; i++) {
      const result = rawDataResults[i];
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        const ep = endpoints[i];
        const processed = await processInChunks(
          result.value, 
          ep.type, 
          baseUrl, 
          { u: username, p: password },
          ep.label
        );
        allChannels = allChannels.concat(processed);
      }
    }

    if (allChannels.length === 0) {
      throw new Error('O painel conectou, mas nenhum conteúdo foi encontrado.');
    }

    // Ordenação rápida: apenas move quem tem logo para o topo, sem overhead excessivo
    return allChannels.sort((a, b) => (b.logo ? 1 : -1));

  } catch (error: any) {
    throw new Error(error.message || "Erro de conexão com o servidor.");
  }
};
