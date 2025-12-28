// API route para leer y escribir galeria-metadata.json usando GitHub API
export default async function handler(req, res) {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const METADATA_FILE = 'admin/galeria-metadata.json';
    const GITHUB_REPO = 'puntoindigo/oliveros';
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // GET: Leer metadata
    if (req.method === 'GET') {
        try {
            // Intentar leer desde GitHub API (fuente de verdad)
            if (GITHUB_TOKEN) {
                try {
                    const githubResponse = await fetch(
                        `https://api.github.com/repos/${GITHUB_REPO}/contents/${METADATA_FILE}`,
                        {
                            headers: {
                                'Authorization': `token ${GITHUB_TOKEN}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        }
                    );

                    if (githubResponse.ok) {
                        const githubData = await githubResponse.json();
                        const content = Buffer.from(githubData.content, 'base64').toString('utf8');
                        const data = JSON.parse(content);
                        return res.status(200).json(data);
                    } else if (githubResponse.status === 404) {
                        // Archivo no existe, devolver objeto vacío
                        return res.status(200).json({});
                    }
                } catch (githubError) {
                    console.error('Error leyendo desde GitHub:', githubError);
                }
            }

            // Fallback: intentar leer desde el archivo estático público
            try {
                const staticResponse = await fetch(`${req.headers.origin || 'https://oliveros.vercel.app'}/admin/galeria-metadata.json`);
                if (staticResponse.ok) {
                    const data = await staticResponse.json();
                    return res.status(200).json(data);
                }
            } catch (staticError) {
                console.error('Error leyendo archivo estático:', staticError);
            }

            // Si todo falla, devolver objeto vacío
            return res.status(200).json({});
        } catch (error) {
            console.error('Error leyendo metadata:', error);
            return res.status(500).json({ error: 'Error leyendo metadata', details: error.message });
        }
    }

    // POST: Guardar metadata
    if (req.method === 'POST') {
        try {
            if (!GITHUB_TOKEN) {
                return res.status(500).json({ 
                    error: 'GITHUB_TOKEN no configurado',
                    mensaje: 'Configura GITHUB_TOKEN en Vercel para poder guardar cambios'
                });
            }

            const newMetadata = req.body;

            if (!newMetadata || typeof newMetadata !== 'object') {
                return res.status(400).json({ error: 'Metadata inválida' });
            }

            // Obtener el SHA del archivo actual (si existe)
            let sha = null;
            try {
                const getResponse = await fetch(
                    `https://api.github.com/repos/${GITHUB_REPO}/contents/${METADATA_FILE}`,
                    {
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );

                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    sha = fileData.sha;
                }
            } catch (error) {
                // El archivo no existe, continuar sin SHA
                console.log('Archivo no existe, se creará nuevo');
            }

            // Convertir metadata a JSON string
            const content = JSON.stringify(newMetadata, null, 2);
            const contentBase64 = Buffer.from(content).toString('base64');

            // Actualizar archivo en GitHub
            const updateResponse = await fetch(
                `https://api.github.com/repos/${GITHUB_REPO}/contents/${METADATA_FILE}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Actualizar metadata de galería - ${new Date().toISOString()}`,
                        content: contentBase64,
                        sha: sha
                    })
                }
            );

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(`GitHub API error: ${errorData.message || updateResponse.statusText}`);
            }

            return res.status(200).json({ 
                success: true, 
                message: 'Metadata guardada correctamente en el repositorio' 
            });

        } catch (error) {
            console.error('Error guardando metadata:', error);
            return res.status(500).json({ 
                error: 'Error guardando metadata', 
                details: error.message 
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

