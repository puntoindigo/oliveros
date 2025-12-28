import { list, head } from '@vercel/blob';

export default async function handler(req, res) {
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
        const { blobs } = await list({
            prefix: 'videos/',
            limit: 1000
        });
        
        console.log('Blobs encontrados:', blobs.length);
        console.log('Primer blob ejemplo:', blobs[0]);
        
        // Filtrar solo videos e imágenes y obtener URLs correctas usando head()
        const archivos = await Promise.all(
            blobs
                .filter(blob => {
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

