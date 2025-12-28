import { put } from '@vercel/blob';

export default async function handler(req, res) {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const metadata = req.body;
        
        if (!metadata) {
            return res.status(400).json({ error: 'Metadata is required' });
        }
        
        // Guardar metadata en Blob Storage
        const blob = await put('galeria-metadata.json', JSON.stringify(metadata, null, 2), {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false,
        });

        return res.status(200).json({ success: true, url: blob.url });
    } catch (error) {
        console.error('Error guardando metadata:', error);
        return res.status(500).json({ 
            error: 'Error guardando metadata',
            details: error.message 
        });
    }
}

