// Configuración
const METADATA_FILE = 'galeria-metadata.json';
const VIDEOS_FOLDER = '/admin/videos/';

// Lista estática de videos (se actualiza manualmente si se agregan nuevos)
const VIDEOS_LIST = [
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

// Verificar autenticación
if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = '/admin/index.html';
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminUser');
        window.location.href = '/admin/index.html';
    });
}

// Estado
let archivos = [];
let metadata = {};
let archivoActual = null;

// Cargar archivos locales estáticos
async function cargarArchivos() {
    try {
        // Convertir lista de videos al formato esperado
        // Intentar primero con ruta directa, luego con API como fallback
        archivos = VIDEOS_LIST.map(filename => ({
            pathname: `videos/${filename}`,
            url: `${VIDEOS_FOLDER}${filename}`,
            apiUrl: `/api/video?filename=${encodeURIComponent(filename)}`,
            filename: filename,
            nombreSinExtension: filename.replace(/\.[^/.]+$/, '')
        }));
        
        console.log('📹 Videos cargados:', archivos.length);
        console.log('📹 URLs de videos:', archivos.map(a => a.url));
        
        await cargarMetadata();
        mostrarArchivos();
    } catch (error) {
        console.error('Error cargando archivos:', error);
        document.getElementById('archivosList').innerHTML = 
            `<p class="error">
                ❌ Error cargando videos: ${error.message}
            </p>`;
    }
}

// Cargar metadata desde API (lee del JSON estático)
async function cargarMetadata() {
    try {
        const response = await fetch('/api/metadata');
        if (response.ok) {
            const jsonData = await response.json();
            metadata = jsonData;
            console.log('✅ Metadata cargada desde JSON');
        } else {
            console.log('ℹ️ No se encontró metadata, iniciando vacío');
            metadata = {};
        }
    } catch (error) {
        console.error('Error cargando metadata:', error);
        metadata = {};
    }
}

// Guardar metadata directamente en el JSON usando API
async function guardarMetadata() {
    try {
        const response = await fetch('/api/metadata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });

        if (response.ok) {
            const result = await response.json();
            mostrarEstado('success', result.message || 'Cambios guardados correctamente en el JSON');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.mensaje || 'Error al guardar');
        }
    } catch (error) {
        console.error('Error guardando metadata:', error);
        mostrarEstado('error', `Error al guardar: ${error.message}. Verifica que GITHUB_TOKEN esté configurado en Vercel.`);
    }
}


// Mostrar lista de archivos
function mostrarArchivos() {
    const container = document.getElementById('archivosList');
    
    if (archivos.length === 0) {
        container.innerHTML = '<p>No hay videos disponibles.</p>';
        console.warn('⚠️ No hay videos en la lista');
        return;
    }
    
    console.log('📋 Mostrando', archivos.length, 'videos en la lista');
    
    container.innerHTML = archivos.map((archivo, index) => {
        const meta = metadata[archivo.pathname] || {};
        const displayTitle = meta.titulo || archivo.nombreSinExtension;
        
        return `
            <div class="archivo-item" data-index="${index}" data-path="${archivo.pathname}">
                <div class="archivo-item-name">${displayTitle}</div>
                <div class="archivo-item-tipo">Video</div>
            </div>
        `;
    }).join('');
    
    // Agregar event listeners
    document.querySelectorAll('.archivo-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            seleccionarArchivo(index);
        });
    });
    
    console.log('✅ Lista de videos renderizada');
}

// Seleccionar archivo
function seleccionarArchivo(index) {
    archivoActual = archivos[index];
    
    // Actualizar UI
    document.querySelectorAll('.archivo-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    // Mostrar editor
    document.getElementById('noSelection').style.display = 'none';
    document.getElementById('editorContainer').style.display = 'block';
    
    // Cargar datos
    const meta = metadata[archivoActual.pathname] || {};
    const nombreSinExtension = archivoActual.nombreSinExtension;
    
    document.getElementById('archivoNombre').textContent = archivoActual.filename;
    document.getElementById('archivoTitulo').value = meta.titulo || nombreSinExtension;
    document.getElementById('archivoComentarios').value = meta.comentarios || '';
    
    // Cargar video
    document.getElementById('videoContainer').style.display = 'block';
    document.getElementById('imageContainer').style.display = 'none';
    
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.style.display = 'block';
    
    let errorShown = false;
    let usingApiRoute = false;
    
    // Manejar errores de forma silenciosa si ya estamos usando la API route
    videoPlayer.addEventListener('error', (e) => {
        // Solo mostrar error si no estamos usando la API route aún
        if (!usingApiRoute && !errorShown) {
            const errorCode = videoPlayer.error?.code;
            const errorMessage = videoPlayer.error?.message || '';
            
            // Ignorar errores de demuxer si el video se está cargando desde API
            if (errorMessage.includes('DEMUXER_ERROR') || errorMessage.includes('Could not open')) {
                // Intentar con API route inmediatamente
                console.log('⚠️ Video directo no disponible, usando API route');
                usingApiRoute = true;
                videoPlayer.src = archivoActual.apiUrl;
                videoPlayer.load();
                return;
            }
            
            // Solo mostrar errores críticos
            if (errorCode === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
                console.error('❌ Formato de video no soportado:', archivoActual.url);
                mostrarEstado('error', 'Formato de video no soportado');
                errorShown = true;
            }
        }
    }, { once: false });
    
    videoPlayer.addEventListener('loadstart', () => {
        console.log('🔄 Iniciando carga del video:', usingApiRoute ? archivoActual.apiUrl : archivoActual.url);
    });
    
    videoPlayer.addEventListener('canplay', () => {
        console.log('✅ Video listo para reproducir');
        errorShown = false; // Resetear flag si el video se carga correctamente
    });
    
    // Intentar primero con la API route directamente (más confiable con Git LFS)
    // Si prefieres intentar primero la ruta directa, cambia el orden
    videoPlayer.src = archivoActual.apiUrl;
    usingApiRoute = true;
    videoPlayer.load();
}

// Guardar cambios
document.getElementById('saveBtn').addEventListener('click', async () => {
    if (!archivoActual) return;
    
    const titulo = document.getElementById('archivoTitulo').value.trim();
    const comentarios = document.getElementById('archivoComentarios').value.trim();
    
    const nombreSinExtension = archivoActual.nombreSinExtension;
    const tituloFinal = titulo || nombreSinExtension;
    
    metadata[archivoActual.pathname] = {
        titulo: tituloFinal,
        comentarios,
        fechaActualizacion: new Date().toISOString()
    };
    
    mostrarEstado('saving', 'Guardando...');
    await guardarMetadata();
    mostrarArchivos(); // Refrescar lista
});

function mostrarEstado(tipo, mensaje) {
    const status = document.getElementById('saveStatus');
    status.className = `save-status ${tipo}`;
    status.textContent = mensaje;
    status.style.display = 'block';
    
    if (tipo === 'success') {
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
}

// Inicializar
cargarArchivos();
