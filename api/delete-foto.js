// API route para eliminar fotos de GitHub
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

    const GITHUB_REPO = 'puntoindigo/oliveros';
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ 
            error: 'GITHUB_TOKEN no configurado',
            mensaje: 'Configura GITHUB_TOKEN en Vercel para poder eliminar fotos'
        });
    }

    try {
        const { path } = req.body || {};

        if (!path) {
            return res.status(400).json({ error: 'No se proporcionó la ruta del archivo' });
        }

        // Obtener el SHA del archivo actual
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!getResponse.ok) {
            if (getResponse.status === 404) {
                return res.status(200).json({ 
                    success: true,
                    message: 'Archivo ya no existe' 
                });
            }
            throw new Error(`Error obteniendo archivo: ${getResponse.statusText}`);
        }

        const fileData = await getResponse.json();
        const sha = fileData.sha;

        // Eliminar archivo de GitHub
        const deleteResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Eliminar foto - ${new Date().toISOString()}`,
                    sha: sha
                })
            }
        );

        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(`GitHub API error: ${errorData.message || deleteResponse.statusText}`);
        }

        return res.status(200).json({ 
            success: true,
            message: 'Foto eliminada correctamente'
        });

    } catch (error) {
        console.error('Error eliminando foto:', error);
        return res.status(500).json({ 
            error: 'Error eliminando foto', 
            details: error.message 
        });
    }
}

