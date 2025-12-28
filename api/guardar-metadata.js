import { put } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const metadata = req.body;
        
        // Guardar metadata en Blob Storage
        const blob = await put('galeria-metadata.json', JSON.stringify(metadata, null, 2), {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false,
        });

        return res.status(200).json({ success: true, url: blob.url });
    } catch (error) {
        console.error('Error guardando metadata:', error);
        return res.status(500).json({ error: 'Error guardando metadata' });
    }
}

