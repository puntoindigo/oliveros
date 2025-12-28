import { list, del } from '@vercel/blob';

export default async function handler(req, res) {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        // Solo listar archivos y mostrar espacio usado
        try {
            const { blobs } = await list({
                limit: 1000
            });

            // Agrupar por pathname para encontrar duplicados
            const archivosPorNombre = {};
            let totalSize = 0;

            blobs.forEach(blob => {
                const nombre = blob.pathname;
                if (!archivosPorNombre[nombre]) {
                    archivosPorNombre[nombre] = [];
                }
                archivosPorNombre[nombre].push(blob);
                totalSize += blob.size || 0;
            });

            // Encontrar duplicados
            const duplicados = Object.entries(archivosPorNombre)
                .filter(([nombre, archivos]) => archivos.length > 1)
                .map(([nombre, archivos]) => ({
                    nombre,
                    cantidad: archivos.length,
                    archivos: archivos.map(a => ({
                        pathname: a.pathname,
                        size: a.size,
                        uploadedAt: a.uploadedAt,
                        url: a.url
                    }))
                }));

            // Listar todos los archivos con su tamaño
            const todosArchivos = blobs.map(blob => ({
                pathname: blob.pathname,
                size: blob.size,
                sizeMB: ((blob.size || 0) / (1024 * 1024)).toFixed(2),
                uploadedAt: blob.uploadedAt,
                url: blob.url
            })).sort((a, b) => (b.size || 0) - (a.size || 0)); // Ordenar por tamaño descendente

            return res.status(200).json({
                totalArchivos: blobs.length,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                totalSizeGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2),
                duplicados: duplicados,
                archivos: todosArchivos,
                archivosGrandes: todosArchivos.filter(a => (a.size || 0) > 100 * 1024 * 1024) // > 100MB
            });

        } catch (error) {
            console.error('Error listando archivos:', error);
            return res.status(500).json({
                error: 'Error listando archivos',
                details: error.message
            });
        }
    }

    if (req.method === 'POST') {
        // Eliminar archivos específicos
        try {
            const { pathnames } = req.body;

            if (!pathnames || !Array.isArray(pathnames)) {
                return res.status(400).json({ error: 'pathnames debe ser un array' });
            }

            const resultados = [];
            const errores = [];

            for (const pathname of pathnames) {
                try {
                    await del(pathname);
                    resultados.push({ pathname, status: 'deleted' });
                } catch (error) {
                    errores.push({ pathname, error: error.message });
                }
            }

            return res.status(200).json({
                success: true,
                eliminados: resultados.length,
                errores: errores.length,
                resultados: resultados,
                errores: errores
            });

        } catch (error) {
            console.error('Error eliminando archivos:', error);
            return res.status(500).json({
                error: 'Error eliminando archivos',
                details: error.message
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

