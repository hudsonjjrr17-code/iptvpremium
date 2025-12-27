
import { Channel, XtreamAccount } from '../types';

/**
 * Tenta realizar o fetch direto. Se falhar por CORS, tenta via proxy.
 */
const smartFetch = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  } catch (error) {
    // Se falhar (provavelmente CORS), tenta via proxy AllOrigins
    console.warn(`Tentativa direta falhou para ${url}. Tentando via proxy de segurança...`);
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyUrl);
    if (!proxyResponse.ok) throw new Error("Erro de conexão persistente (CORS/Host Off)");
    return proxyResponse;
  }
};

export const fetchXtreamData = async (account: XtreamAccount): Promise<Channel[]> => {
  const { url, username, password } = account;
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  
  // Proteção contra Mixed Content (HTTPS -> HTTP)
  if (window.location.protocol === 'https:' && baseUrl.startsWith('http:')) {
    console.warn("Aviso: Tentando acessar servidor HTTP a partir de site HTTPS. O proxy será obrigatório.");
  }

  const apiUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}`;

  try {
    // 1. Autenticação
    const authResponse = await smartFetch(apiUrl);
    const authData = await authResponse.json();

    if (!authData.user_info || authData.user_info.auth === 0) {
      throw new Error('Credenciais de acesso incorretas ou conta expirada.');
    }

    // 2. Buscar Canais ao Vivo
    const liveResponse = await smartFetch(`${apiUrl}&action=get_live_streams`);
    const liveData = await liveResponse.json();

    // 3. Buscar Filmes (VOD)
    const vodResponse = await smartFetch(`${apiUrl}&action=get_vod_streams`);
    const vodData = await vodResponse.json();

    const formattedChannels: Channel[] = [
      ...(Array.isArray(liveData) ? liveData.map((item: any) => ({
        id: `live-${item.stream_id}`,
        name: item.name,
        logo: item.stream_icon,
        category: item.category_name || 'Live TV',
        url: `${baseUrl}/live/${username}/${password}/${item.stream_id}.m3u8`,
        isFavorite: false,
        description: `Canal transmitido em HD via Servidor Privado.`,
        streamId: item.stream_id,
        type: 'live' as const
      })) : []),
      ...(Array.isArray(vodData) ? vodData.map((item: any) => ({
        id: `vod-${item.stream_id}`,
        name: item.name,
        logo: item.stream_icon,
        category: 'Movies',
        url: `${baseUrl}/movie/${username}/${password}/${item.stream_id}.${item.container_extension || 'mp4'}`,
        isFavorite: false,
        description: `Filme disponível no catálogo Premium.`,
        streamId: item.stream_id,
        type: 'movie' as const
      })) : [])
    ];

    if (formattedChannels.length === 0) {
      throw new Error('Nenhum conteúdo encontrado nesta lista.');
    }

    return formattedChannels;
  } catch (error: any) {
    console.error('Erro detalhado Xtream:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Erro de Conexão: O servidor IPTV bloqueou o acesso ou está offline. Tente usar um Host com HTTPS.');
    }
    throw error;
  }
};
