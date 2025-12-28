import { list, head } from '@vercel/blob';

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
        // Listar archivos en la carpeta videos/
        let blobs;
        try {
            const result = await list({
                prefix: 'videos/',
                limit: 1000
            });
            blobs = result.blobs || [];
        } catch (blobError) {
            console.error('Error accediendo a Blob Storage:', blobError);
            // Si el store está bloqueado o hay problemas, retornar error claro
            return res.status(503).json({
                error: 'Blob Storage no disponible',
                detalles: blobError.message,
                solucion: 'El Blob Store puede estar bloqueado. Considera usar YouTube para los videos.',
                alternativas: [
                    '1. Configura YouTube (ver CONFIGURAR_YOUTUBE.md)',
                    '2. O desbloquea el Blob Store eliminando archivos grandes'
                ]
            });
        }
        
        console.log('Blobs encontrados:', blobs?.length || 0);
        
        if (!blobs || blobs.length === 0) {
            return res.status(200).json({ archivos: [] });
        }
        
        // Filtrar solo videos e imágenes y obtener URLs correctas usando head()
        const archivos = await Promise.all(
            blobs
                .filter(blob => {
                    if (!blob || !blob.pathname) return false;
                    const ext = blob.pathname.split('.').pop().toLowerCase();
                    return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
                })
                .map(async (blob) => {
                    try {
                        // Usar head() para obtener la información completa del blob
                        const blobInfo = await head(blob.pathname);
                        
                        // La URL pública debería venir directamente de blobInfo.url
                        const url = blobInfo.url;
                        
                        console.log(`Archivo: ${blob.pathname}`);
                        console.log(`  - URL: ${url}`);
                        console.log(`  - Es pública: ${url ? url.includes('.public.blob.vercel-storage.com') : 'NO'}`);
                        
                        return {
                            pathname: blob.pathname,
                            url: url, // Usar la URL de head() que es la correcta
                            size: blob.size,
                            uploadedAt: blob.uploadedAt,
                            access: blobInfo.access || 'unknown'
                        };
                    } catch (error) {
                        console.error(`Error obteniendo info de ${blob.pathname}:`, error);
                        // Fallback a la URL del blob original
                        return {
                            pathname: blob.pathname,
                            url: blob.url || `https://1noprvsrhcvtamry.public.blob.vercel-storage.com/${blob.pathname}`,
                            size: blob.size,
                            uploadedAt: blob.uploadedAt,
                            access: 'error'
                        };
                    }
                })
        );

        return res.status(200).json({ archivos });
    } catch (error) {
        console.error('Error listando archivos:', error);
        return res.status(500).json({ 
            error: 'Error listando archivos',
            details: error.message 
        });
    }
}

