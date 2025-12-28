import { list } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Listar archivos en la carpeta videos/
        const { blobs } = await list({
            prefix: 'videos/',
            limit: 1000
        });
        
        // Filtrar solo videos e imágenes
        const archivos = blobs.filter(blob => {
            const ext = blob.pathname.split('.').pop().toLowerCase();
            return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
        });

        return res.status(200).json({ archivos });
    } catch (error) {
        console.error('Error listando archivos:', error);
        return res.status(500).json({ error: 'Error listando archivos' });
    }
}

