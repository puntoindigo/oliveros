// API route para servir videos desde GitHub LFS
export default async function handler(req, res) {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { filename } = req.query;

    if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
    }

    // Lista de videos permitidos (seguridad)
    const allowedVideos = [
        'cab1.mp4',
        'cab2.mp4',
        'cab3.mp4',
        'cab4-grande.mp4',
        'cab5.mp4',
        'deposito.mp4',
        'material.mp4',
        'quincho.mp4',
        'recorrida.mp4'
    ];

    if (!allowedVideos.includes(filename)) {
        return res.status(403).json({ error: 'Video not allowed' });
    }

    const GITHUB_REPO = 'puntoindigo/oliveros';
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const VIDEO_PATH = `admin/videos/${filename}`;

    try {
        // Intentar obtener el archivo desde GitHub API
        if (GITHUB_TOKEN) {
            const githubResponse = await fetch(
                `https://api.github.com/repos/${GITHUB_REPO}/contents/${VIDEO_PATH}`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (githubResponse.ok) {
                const fileData = await githubResponse.json();
                
                // Si el archivo está en Git LFS, el content será null y habrá un download_url
                if (fileData.download_url) {
                    // En lugar de redirigir, hacer proxy del video para evitar problemas CORS
                    const videoResponse = await fetch(fileData.download_url);
                    if (videoResponse.ok) {
                        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
                        res.setHeader('Content-Type', 'video/mp4');
                        res.setHeader('Content-Length', videoBuffer.length);
                        res.setHeader('Accept-Ranges', 'bytes');
                        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        return res.send(videoBuffer);
                    }
                }
                
                // Si no es LFS, decodificar el contenido base64
                if (fileData.content) {
                    const videoBuffer = Buffer.from(fileData.content, 'base64');
                    res.setHeader('Content-Type', 'video/mp4');
                    res.setHeader('Content-Length', videoBuffer.length);
                    res.setHeader('Accept-Ranges', 'bytes');
                    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    return res.send(videoBuffer);
                }
            }
        }

        // Fallback: intentar servir desde el sistema de archivos (si está disponible)
        // Esto solo funcionará si Git LFS descargó los archivos durante el build
        try {
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(process.cwd(), VIDEO_PATH);
            
            if (fs.existsSync(filePath)) {
                const videoBuffer = fs.readFileSync(filePath);
                res.setHeader('Content-Type', 'video/mp4');
                res.setHeader('Content-Length', videoBuffer.length);
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('Access-Control-Allow-Origin', '*');
                return res.send(videoBuffer);
            }
        } catch (fsError) {
            console.log('File system not available, using GitHub API');
        }

        return res.status(404).json({ error: 'Video not found' });

    } catch (error) {
        console.error('Error serving video:', error);
        return res.status(500).json({ error: 'Error serving video', details: error.message });
    }
}

