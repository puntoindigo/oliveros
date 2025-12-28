import { head } from '@vercel/blob';

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
        const { pathname } = req.query;
        
        if (!pathname) {
            return res.status(400).json({ error: 'pathname is required' });
        }

        // Obtener información del blob
        const blob = await head(pathname);
        
        // Si el blob es público, devolver la URL pública
        if (blob.url) {
            return res.status(200).json({ url: blob.url });
        }
        
        // Si no es público, intentar construir la URL pública (puede fallar con 403)
        const storeId = '1noprvsrhcvtamry';
        const publicUrl = `https://${storeId}.public.blob.vercel-storage.com/${pathname}`;
        
        return res.status(200).json({ 
            url: publicUrl,
            warning: 'File may be private. Make it public in Blob Storage settings.'
        });
    } catch (error) {
        console.error('Error obteniendo URL del video:', error);
        return res.status(500).json({ 
            error: 'Error obteniendo URL del video',
            details: error.message 
        });
    }
}

