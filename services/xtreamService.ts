
import { Channel, XtreamAccount } from '../types';

/**
 * Função de busca inteligente com tratamento de CORS e erros de rede.
 */
const smartFetch = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout

  try {
    // Tentativa 1: Direta (Mais rápida, mas sujeita a CORS)
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) return response;
    throw new Error(`Server returned ${response.status}`);
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Tentativa 2: Via Proxy (Lenta, mas contorna CORS e Mixed Content)
    console.warn(`Tentativa direta falhou para ${url}. Usando túnel de segurança...`);
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    const proxyResponse = await fetch(proxyUrl);
    if (proxyResponse.ok) return proxyResponse;
    
    throw new Error("O servidor IPTV não respondeu ou bloqueou a conexão externa.");
  }
};

export const fetchXtreamData = async (account: XtreamAccount): Promise<Channel[]> => {
  const { url, username, password } = account;
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const authParams = `username=${username}&password=${password}`;
  const apiUrl = `${baseUrl}/player_api.php?${authParams}`;

  try {
    // 1. Validar Conexão e Autenticação
    const authRes = await smartFetch(apiUrl);
    const authData = await authRes.json();

    if (!authData.user_info || authData.user_info.auth === 0) {
      throw new Error('Usuário ou senha inválidos no servidor informado.');
    }

    // 2. Buscar em paralelo para otimizar tempo (Live, VOD e Séries)
    const [liveRes, vodRes, seriesRes] = await Promise.all([
      smartFetch(`${apiUrl}&action=get_live_streams`),
      smartFetch(`${apiUrl}&action=get_vod_streams`),
      smartFetch(`${apiUrl}&action=get_series`)
    ]);

    const [liveData, vodData, seriesData] = await Promise.all([
      liveRes.json(),
      vodRes.json(),
      seriesRes.json()
    ]);

    const allChannels: Channel[] = [];

    // Processar Canais Ao Vivo
    if (Array.isArray(liveData)) {
      liveData.forEach((item: any) => {
        allChannels.push({
          id: `live-${item.stream_id}`,
          name: item.name || 'Canal Sem Nome',
          logo: item.stream_icon || '',
          category: item.category_name || 'TV ao Vivo',
          url: `${baseUrl}/live/${username}/${password}/${item.stream_id}.m3u8`,
          isFavorite: false,
          description: `Qualidade: HD/FHD`,
          streamId: item.stream_id,
          type: 'live'
        });
      });
    }

    // Processar Filmes
    if (Array.isArray(vodData)) {
      vodData.forEach((item: any) => {
        allChannels.push({
          id: `vod-${item.stream_id}`,
          name: item.name || 'Filme',
          logo: item.stream_icon || '',
          category: 'Filmes',
          url: `${baseUrl}/movie/${username}/${password}/${item.stream_id}.${item.container_extension || 'mp4'}`,
          isFavorite: false,
          description: `VOD Premium`,
          streamId: item.stream_id,
          type: 'movie'
        });
      });
    }

    // Processar Séries
    if (Array.isArray(seriesData)) {
      seriesData.forEach((item: any) => {
        allChannels.push({
          id: `series-${item.series_id}`,
          name: item.name || 'Série',
          logo: item.cover || item.stream_icon || '',
          category: 'Séries',
          url: `${apiUrl}&action=get_series_info&series_id=${item.series_id}`, // URL para info da série
          isFavorite: false,
          description: `Série Completa`,
          streamId: item.series_id,
          type: 'series'
        });
      });
    }

    if (allChannels.length === 0) {
      throw new Error('A conta foi validada, mas a lista de conteúdos retornou vazia.');
    }

    return allChannels;

  } catch (error: any) {
    console.error('Erro Crítico no Serviço Xtream:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Tempo esgotado: O servidor demorou demais para responder.');
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('status: 0')) {
      throw new Error('Falha de Rede: O servidor IPTV é inseguro (HTTP) ou bloqueia conexões via navegador. Tente outro Host.');
    }

    throw error;
  }
};
