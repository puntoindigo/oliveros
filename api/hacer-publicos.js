import { list, head, del, put, get } from '@vercel/blob';

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
        // Listar todos los archivos en videos/
        const { blobs } = await list({
            prefix: 'videos/',
            limit: 1000
        });

        const resultados = [];
        const errores = [];

        for (const blob of blobs) {
            try {
                // Verificar si ya es público
                const blobInfo = await head(blob.pathname);
                
                // Si ya tiene URL pública, asumimos que es público
                if (blobInfo.url && blobInfo.url.includes('.public.blob.vercel-storage.com')) {
                    resultados.push({
                        pathname: blob.pathname,
                        status: 'already_public',
                        url: blobInfo.url
                    });
                    continue;
                }

                // Obtener el contenido del archivo usando la API de Vercel Blob
                // Esto funciona incluso si el archivo es privado porque usamos el token del servidor
                let fileBuffer;
                let contentType = blob.contentType || blobInfo.contentType || 'application/octet-stream';
                
                try {
                    // Intentar usar get() de @vercel/blob para obtener el contenido directamente
                    const blobContent = await get(blob.pathname);
                    fileBuffer = await blobContent.arrayBuffer();
                    contentType = blobContent.contentType || contentType;
                } catch (getError) {
                    // Si get() falla, intentar descargar desde la URL
                    console.log(`get() falló para ${blob.pathname}, intentando fetch...`);
                    const urlsToTry = [
                        blob.url,
                        blob.downloadUrl,
                        blob.publicUrl
                    ].filter(Boolean);

                    let downloaded = false;
                    for (const url of urlsToTry) {
                        try {
                            const fileResponse = await fetch(url);
                            if (fileResponse.ok) {
                                fileBuffer = await fileResponse.arrayBuffer();
                                downloaded = true;
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }

                    if (!downloaded) {
                        throw new Error(`No se pudo obtener el contenido de ${blob.pathname}`);
                    }
                }

                // Eliminar el archivo privado
                await del(blob.pathname);

                // Subir nuevamente como público
                const newBlob = await put(blob.pathname, fileBuffer, {
                    access: 'public',
                    contentType: contentType,
                    addRandomSuffix: false,
                });

                resultados.push({
                    pathname: blob.pathname,
                    status: 'made_public',
                    url: newBlob.url
                });

            } catch (error) {
                console.error(`Error procesando ${blob.pathname}:`, error);
                errores.push({
                    pathname: blob.pathname,
                    error: error.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            total: blobs.length,
            procesados: resultados.length,
            errores: errores.length,
            resultados: resultados,
            errores: errores
        });

    } catch (error) {
        console.error('Error haciendo públicos los videos:', error);
        return res.status(500).json({
            error: 'Error haciendo públicos los videos',
            details: error.message
        });
    }
}

