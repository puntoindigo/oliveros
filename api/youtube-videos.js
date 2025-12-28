// Vercel Serverless Function handler
export default async function handler(req, res) {
    // Verificar que req y res existen (compatibilidad)
    if (!req || !res) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Invalid request/response objects' })
        };
    }
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Obtener playlistId o channelId de query params o variables de entorno
        const playlistId = req.query.playlistId || process.env.YOUTUBE_PLAYLIST_ID;
        const channelId = req.query.channelId || process.env.YOUTUBE_CHANNEL_ID;
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        
        // Verificar configuración
        if (!YOUTUBE_API_KEY) {
            return res.status(200).json({
                configuracionNecesaria: true,
                mensaje: 'YOUTUBE_API_KEY no está configurada',
                instrucciones: [
                    '1. Ve a https://console.cloud.google.com/',
                    '2. Crea un proyecto o selecciona uno existente',
                    '3. Habilita YouTube Data API v3',
                    '4. Crea una API Key',
                    '5. Agrega YOUTUBE_API_KEY como variable de entorno en Vercel'
                ]
            });
        }
        
        if (!playlistId && !channelId) {
            return res.status(200).json({
                configuracionNecesaria: true,
                mensaje: 'YOUTUBE_PLAYLIST_ID o YOUTUBE_CHANNEL_ID no está configurado',
                instrucciones: [
                    '1. Crea una playlist en YouTube',
                    '2. Obtén el Playlist ID de la URL (ej: PLxxxxxxxxxxxxx)',
                    '3. Agrega YOUTUBE_PLAYLIST_ID como variable de entorno en Vercel',
                    '4. O configura YOUTUBE_CHANNEL_ID si prefieres usar el canal completo'
                ]
            });
        }

        let videos = [];
        
        if (playlistId) {
            // Listar videos de una playlist
            const playlistResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
            );
            
            if (!playlistResponse.ok) {
                throw new Error(`Error de YouTube API: ${playlistResponse.statusText}`);
            }
            
            const playlistData = await playlistResponse.json();
            
            videos = playlistData.items.map(item => ({
                videoId: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
                publishedAt: item.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                embedUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`
            }));
        } else if (channelId) {
            // Primero obtener el uploads playlist del canal
            const channelResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
            );
            
            if (!channelResponse.ok) {
                throw new Error(`Error de YouTube API: ${channelResponse.statusText}`);
            }
            
            const channelData = await channelResponse.json();
            const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
            
            if (!uploadsPlaylistId) {
                throw new Error('No se pudo obtener la playlist de uploads del canal');
            }
            
            // Listar videos de la playlist de uploads
            const playlistResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
            );
            
            if (!playlistResponse.ok) {
                throw new Error(`Error de YouTube API: ${playlistResponse.statusText}`);
            }
            
            const playlistData = await playlistResponse.json();
            
            videos = playlistData.items.map(item => ({
                videoId: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
                publishedAt: item.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                embedUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`
            }));
        }

        return res.status(200).json({
            success: true,
            total: videos.length,
            videos: videos
        });

    } catch (error) {
        console.error('Error obteniendo videos de YouTube:', error);
        return res.status(500).json({
            error: 'Error obteniendo videos de YouTube',
            details: error.message
        });
    }
}

