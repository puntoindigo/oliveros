import { list } from '@vercel/blob';

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
        
        // Filtrar solo videos e imágenes y asegurar que tengan URL
        const archivos = blobs
            .filter(blob => {
                const ext = blob.pathname.split('.').pop().toLowerCase();
                return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
            })
            .map(blob => {
                // La URL debería venir directamente del blob si es público
                // Si no viene, intentamos construirla pero puede fallar si no es público
                let url = blob.url || blob.downloadUrl || blob.publicUrl;
                
                // Si no hay URL, construirla (pero esto solo funciona si el archivo es público)
                if (!url && blob.pathname) {
                    const storeId = '1noprvsrhcvtamry';
                    url = `https://${storeId}.public.blob.vercel-storage.com/${blob.pathname}`;
                }
                
                console.log(`Archivo: ${blob.pathname}, URL: ${url}, Access: ${blob.access || 'unknown'}`);
                
                return {
                    pathname: blob.pathname,
                    url: url,
                    size: blob.size,
                    uploadedAt: blob.uploadedAt,
                    access: blob.access || 'unknown'
                };
            });

        return res.status(200).json({ archivos });
    } catch (error) {
        console.error('Error listando archivos:', error);
        return res.status(500).json({ 
            error: 'Error listando archivos',
            details: error.message 
        });
    }
}

