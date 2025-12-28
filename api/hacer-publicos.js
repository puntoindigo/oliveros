import { list, head, del, put } from '@vercel/blob';

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

                // Obtener el contenido del archivo
                // Intentar diferentes URLs posibles
                let fileResponse;
                const urlsToTry = [
                    blob.url,
                    blob.downloadUrl,
                    blob.publicUrl,
                    `https://1noprvsrhcvtamry.public.blob.vercel-storage.com/${blob.pathname}`
                ].filter(Boolean);

                let downloaded = false;
                for (const url of urlsToTry) {
                    try {
                        fileResponse = await fetch(url);
                        if (fileResponse.ok) {
                            downloaded = true;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                if (!downloaded || !fileResponse.ok) {
                    throw new Error(`No se pudo descargar ${blob.pathname}. El archivo puede ser privado y requerir autenticación.`);
                }

                const fileBuffer = await fileResponse.arrayBuffer();
                const contentType = blob.contentType || blobInfo.contentType || 'application/octet-stream';

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

