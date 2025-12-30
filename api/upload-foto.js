// API route para subir fotos a GitHub
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
    const FOTOS_FOLDER = 'admin/fotos/';

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ 
            error: 'GITHUB_TOKEN no configurado',
            mensaje: 'Configura GITHUB_TOKEN en Vercel para poder subir fotos'
        });
    }

    try {
        // Obtener datos del body JSON
        const { file, fileName, fileType, archivoPath } = await req.json();

        if (!file || !fileName) {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        }

        // El archivo ya viene en base64 desde el cliente
        const contentBase64 = file;

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const nombreOriginal = fileName;
        const extension = nombreOriginal.split('.').pop() || 'jpg';
        const nombreArchivo = `${archivoPath.replace(/\//g, '_')}_${timestamp}.${extension}`;
        const filePath = `${FOTOS_FOLDER}${nombreArchivo}`;

        // Subir archivo a GitHub
        const uploadResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Subir foto: ${nombreOriginal} - ${new Date().toISOString()}`,
                    content: contentBase64
                })
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(`GitHub API error: ${errorData.message || uploadResponse.statusText}`);
        }

        const uploadData = await uploadResponse.json();

        // Construir URL pública de la foto (usar raw.githubusercontent.com para imágenes)
        const fotoUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${filePath}`;

        return res.status(200).json({ 
            success: true,
            url: fotoUrl,
            path: filePath,
            nombre: nombreOriginal,
            message: 'Foto subida correctamente'
        });

    } catch (error) {
        console.error('Error subiendo foto:', error);
        return res.status(500).json({ 
            error: 'Error subiendo foto', 
            details: error.message 
        });
    }
}

