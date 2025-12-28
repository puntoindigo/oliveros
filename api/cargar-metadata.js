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
        // Intentar cargar el archivo de metadata
        try {
            const blob = await head('galeria-metadata.json');
            const response = await fetch(blob.url);
            
            if (response.ok) {
                const metadata = await response.json();
                return res.status(200).json({ metadata });
            }
        } catch (error) {
            // Si el archivo no existe, retornar objeto vacío
            console.log('Metadata file does not exist yet, creating empty object');
        }

        return res.status(200).json({ metadata: {} });
    } catch (error) {
        console.error('Error cargando metadata:', error);
        return res.status(200).json({ metadata: {} }); // Retornar vacío en caso de error
    }
}

